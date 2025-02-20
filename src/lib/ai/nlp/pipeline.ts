import { pipeline, Pipeline } from "@xenova/transformers";

type NLPTask =
  | "sentiment-analysis"
  | "text-classification"
  | "ner"
  | "summarization";

class NLPPipeline {
  private pipelines: Map<NLPTask, Pipeline> = new Map();

  async initialize(tasks: NLPTask[]) {
    for (const task of tasks) {
      if (!this.pipelines.has(task)) {
        const pipe = await pipeline(task);
        this.pipelines.set(task, pipe);
      }
    }
  }

  async analyze(task: NLPTask, text: string) {
    if (!this.pipelines.has(task)) {
      await this.initialize([task]);
    }

    const pipe = this.pipelines.get(task);
    if (!pipe) throw new Error(`Pipeline not found for task: ${task}`);

    return await pipe(text);
  }

  async analyzeSentiment(text: string) {
    return this.analyze("sentiment-analysis", text);
  }

  async classifyText(text: string) {
    return this.analyze("text-classification", text);
  }

  async extractEntities(text: string) {
    return this.analyze("ner", text);
  }

  async summarize(text: string) {
    return this.analyze("summarization", text);
  }
}

export const nlpPipeline = new NLPPipeline();
