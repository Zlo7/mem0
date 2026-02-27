import { Ollama } from "ollama";
import { Embedder } from "./base";
import { EmbeddingConfig } from "../types";
import { logger } from "../utils/logger";

export class OllamaEmbedder implements Embedder {
  private ollama: Ollama;
  private model: string;
  private embeddingDims?: number;
  // Using this variable to avoid calling the Ollama server multiple times
  private initialized: boolean = false;

  constructor(config: EmbeddingConfig) {
    this.ollama = new Ollama({
      host: config.url || "http://localhost:11434",
    });
    this.model = config.model || "nomic-embed-text:latest";
    this.embeddingDims = config.embeddingDims || 768;
    this.ensureModelExists().catch((err) => {
      logger.error(`Error ensuring model exists: ${err}`);
    });
  }

  async embed(text: string | any): Promise<number[]> {
    try {
      await this.ensureModelExists();
    } catch (err) {
      logger.error(`Error ensuring model exists: ${err}`);
    }

    // Defensive coercion: callers (especially graph_memory) may pass objects
    let safeText: string;
    if (typeof text === "string") {
      safeText = text;
    } else if (text == null) {
      safeText = "";
    } else if (typeof text === "object") {
      const candidate =
        text.fact ??
        text.text ??
        text.memory ??
        text.data ??
        text.source ??
        text.destination ??
        text.entity ??
        text.name ??
        text.content ??
        text.query ??
        text.value;
      safeText =
        typeof candidate === "string" ? candidate : JSON.stringify(text);
    } else {
      safeText = String(text);
    }

    if (!safeText || safeText === "{}" || safeText === "null") {
      return new Array(this.embeddingDims || 768).fill(0);
    }

    const response = await this.ollama.embeddings({
      model: this.model,
      prompt: safeText,
    });
    return response.embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await Promise.all(texts.map((text) => this.embed(text)));
    return response;
  }

  private async ensureModelExists(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    const local_models = await this.ollama.list();
    if (!local_models.models.find((m: any) => m.name === this.model)) {
      logger.info(`Pulling model ${this.model}...`);
      await this.ollama.pull({ model: this.model });
    }
    this.initialized = true;
    return true;
  }
}
