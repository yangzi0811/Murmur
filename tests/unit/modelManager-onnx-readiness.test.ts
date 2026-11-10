// [20261110_Fix_OnnxReadiness] Reproduce the installed ONNX-only startup gate.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import ModelManager from "../../src/helpers/modelManager";

describe("ONNX-only model readiness", () => {
  let directory: string;
  let manager: ModelManager;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "onnx-readiness-"));
    manager = new ModelManager({ warn: () => {} });
    manager.clearCache();
    manager.getModelCachePath = () => path.join(directory, "legacy-absent");
    manager.getOnnxModelsRoot = () => path.join(directory, "onnx-int8");
    manager.getModelPinPath = () => path.join(directory, "pin.json");
    const models = Object.fromEntries(
      ["asr", "vad", "punc", "speaker"].map((role) => {
        const modelDirectory = path.join(manager.getOnnxModelsRoot(), role);
        fs.mkdirSync(modelDirectory, { recursive: true });
        fs.writeFileSync(path.join(modelDirectory, "model.onnx"), "test");
        return [
          role,
          {
            name: role,
            modelscope_repo: `iic/${role}`,
            model_revision: "v2.0.4",
            checkpoint_commit: "a".repeat(40),
            export: { funasr: "1.3.1", torch: "2.0.1" },
            files: [
              {
                path: "model.onnx",
                size_bytes: 4,
                sha256: "b".repeat(64),
                asset: `${role}__model.onnx`,
              },
            ],
          },
        ];
      }),
    );
    fs.writeFileSync(
      manager.getModelPinPath(),
      JSON.stringify({
        schema_version: 1,
        generated_utc: "2026-11-10T00:00:00Z",
        license: "Apache-2.0",
        attribution: "Test fixture",
        release: {
          tag: "models-test",
          url: "https://example.com/release",
          asset_base_url: "https://example.com/assets/",
        },
        models,
      }),
    );
  });

  afterEach(() => {
    manager.clearCache();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it("accepts a complete ONNX set without any torch cache", async () => {
    const result = await manager.checkModelFiles();
    expect(result.models_downloaded).toBe(true);
    expect(result.minimum_ready).toBe(true);
    expect(result.missing_models).toEqual([]);
    expect(result.cache_path).toBe(manager.getOnnxModelsRoot());
  });

  it("does not accept an incomplete required model", async () => {
    fs.writeFileSync(
      path.join(manager.getOnnxModelsRoot(), "vad", "model.onnx"),
      "x",
    );
    const result = await manager.checkModelFiles();
    expect(result.models_downloaded).toBe(false);
    expect(result.minimum_ready).not.toBe(true);
  });

  it("allows recognition when the optional punctuation model is missing", async () => {
    fs.unlinkSync(path.join(manager.getOnnxModelsRoot(), "punc", "model.onnx"));
    const result = await manager.checkModelFiles();
    expect(result.models_downloaded).toBe(false);
    expect(result.minimum_ready).toBe(true);
    expect(result.missing_models).toEqual(["punc"]);
  });

  it("does not require the optional speaker model for basic recognition", async () => {
    fs.unlinkSync(
      path.join(manager.getOnnxModelsRoot(), "speaker", "model.onnx"),
    );
    expect((await manager.checkModelFiles()).models_downloaded).toBe(true);
  });
});
