import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Check,
  Copy,
  FileCode2,
  FlaskConical,
  Terminal,
  TriangleAlert,
} from "lucide-react";


/* =========================================================
   AI TEST GENERATION
========================================================= */

export default function AITestGenerationView({
  onNavigate,
  selectedFile: initialFile,
}) {

  const [result, setResult] =
    useState(null);

  const [selectedPath, setSelectedPath] =
    useState(initialFile || null);

  const [generated, setGenerated] =
    useState("");

  const [generating, setGenerating] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD ANALYSIS
  ======================================================= */

  useEffect(() => {

    try {

      const saved =
        localStorage.getItem(
          "latestAnalysisResult"
        );


      if (!saved) {

        setResult(null);

        return;

      }


      const data =
        JSON.parse(saved);


      if (
        data &&
        typeof data === "object"
      ) {

        setResult(data);

      } else {

        setResult(null);

      }

    } catch (error) {

      console.error(
        "Could not load analysis:",
        error
      );

      setResult(null);

    }

  }, []);


  /* =======================================================
     UPDATE SELECTED FILE
  ======================================================= */

  useEffect(() => {

    if (initialFile) {

      setSelectedPath(
        initialFile
      );

    }

  }, [initialFile]);


  /* =======================================================
     FILES
  ======================================================= */

  const files = Array.isArray(
    result?.files
  )
    ? result.files
    : [];


  /* =======================================================
     SELECTED FILE
  ======================================================= */

  const selected = selectedPath
    ? files.find(
        (file) =>
          (
            file?.filePath ||
            file?.fileName
          ) === selectedPath
      )
    : null;


  /* =======================================================
     NAVIGATION
  ======================================================= */

  const go = (
    page,
    state = {}
  ) => {

    if (onNavigate) {

      onNavigate(
        page,
        state
      );

      return;

    }


    window.dispatchEvent(
      new CustomEvent(
        "app:navigate",
        {
          detail: {
            page,
            ...state,
          },
        }
      )
    );

  };


  /* =======================================================
     COPY GENERATED TEST
  ======================================================= */

  const copyGeneratedTest =
    async () => {

      if (!generated) {
        return;
      }


      try {

        await navigator.clipboard.writeText(
          generated
        );

        setCopied(true);


        setTimeout(() => {

          setCopied(false);

        }, 1500);

      } catch (error) {

        console.error(
          "Copy failed:",
          error
        );

      }

    };


  /* =======================================================
     GENERATE TESTS
     
     IMPORTANT:
     There is NO fake setTimeout,
     fake test code or fake PASS state.
     
     This will be connected to the real
     Spring Boot + OpenRouter endpoint.
  ======================================================= */

  const generate = async () => {

    if (!selected) {

      setError(
        "Select a file before generating tests."
      );

      return;

    }


    setError("");

    setGenerated("");

    setGenerating(true);


    /*
     * Real AI endpoint is not connected yet.
     *
     * Do not pretend that an LLM generated
     * tests when it has not actually done so.
     */

    setGenerating(false);

    setError(
      "AI test generation endpoint is not connected yet. Connect the backend OpenRouter test-generation endpoint before generating tests."
    );

  };


  /* =======================================================
     NO ANALYSIS
  ======================================================= */

  if (!result) {

    return (

      <div className="mx-auto max-w-6xl p-6 text-slate-200">

        <div className="rounded-xl border border-dashed border-slate-700 bg-[#141415] p-16 text-center">

          <FlaskConical className="mx-auto h-10 w-10 text-slate-700" />

          <h1 className="mt-4 text-lg font-semibold">
            No analysis available
          </h1>

          <p className="mt-2 text-xs text-slate-500">
            Run a repository analysis from
            the Dashboard first.
          </p>


          <button
            onClick={() =>
              go("Dashboard")
            }
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold"
          >
            Go to Dashboard
          </button>

        </div>

      </div>

    );

  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (

    <div className="mx-auto max-w-6xl space-y-5 p-6 text-slate-200">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-800 pb-5">

        <button
          onClick={() =>
            go("Dashboard")
          }
          className="mb-3 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300"
        >

          <ArrowLeft className="h-3.5 w-3.5" />

          Dashboard

        </button>


        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
          Targeted Testing
        </p>


        <h1 className="mt-1 text-2xl font-bold">
          AI Test Generation
        </h1>


        <p className="mt-1 text-sm text-slate-500">
          Generate tests after static analysis
          identifies code worth investigating.
        </p>

      </header>


      {/* =================================================
          SELECT HIGH-RISK CODE
      ================================================= */}

      <section className="rounded-xl border border-slate-800 bg-[#141415] p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-sm font-semibold">
              Select Code
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a file from the current
              static analysis.
            </p>

          </div>


          <button
            onClick={() =>
              go(
                "AST Analysis",
                {
                  selectedFile:
                    selected?.filePath ||
                    selected?.fileName,
                }
              )
            }
            disabled={!selected}
            className="text-xs font-semibold text-indigo-400 disabled:opacity-40"
          >
            Inspect AST →
          </button>

        </div>


        {files.length > 0 ? (

          <div className="grid gap-2">

            {files.map(
              (file, index) => {

                const path =
                  file?.filePath ||
                  file?.fileName;


                const selectedFile =
                  selectedPath === path;


                return (

                  <button
                    key={`${path}-${index}`}
                    onClick={() => {

                      setSelectedPath(
                        path
                      );

                      setGenerated("");

                      setError("");

                    }}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left ${
                      selectedFile
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-slate-800 bg-[#1a1a1c] hover:border-slate-600"
                    }`}
                  >

                    <span className="flex min-w-0 items-center gap-2">

                      <FileCode2 className="h-4 w-4 shrink-0 text-indigo-400" />

                      <span className="truncate text-xs">

                        {
                          file?.filePath ||
                          file?.fileName ||
                          "Unnamed file"
                        }

                      </span>

                    </span>


                    <div className="ml-3 flex shrink-0 items-center gap-3">

                      {file?.riskLevel && (

                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                          {
                            file.riskLevel
                          }
                        </span>

                      )}


                      <span className="font-mono text-[10px] text-slate-500">

                        CC{" "}

                        {file?.cyclomaticComplexity !==
                          null &&
                        file?.cyclomaticComplexity !==
                          undefined
                          ? file.cyclomaticComplexity
                          : "—"}

                      </span>

                    </div>

                  </button>

                );

              }
            )}

          </div>

        ) : (

          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-xs text-slate-500">

            No files were returned by
            the analysis.

          </div>

        )}

      </section>


      {/* =================================================
          SELECTED TARGET
      ================================================= */}

      {selected && (

        <section className="rounded-xl border border-slate-800 bg-[#141415] p-5">


          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                Selected target
              </div>


              <div className="mt-1 text-sm font-semibold text-slate-200">

                {
                  selected.fileName ||
                  selected.filePath ||
                  "Unnamed file"
                }

              </div>


              {selected.filePath && (

                <div className="mt-1 text-[10px] text-slate-500">
                  {selected.filePath}
                </div>

              )}


              <div className="mt-2 flex flex-wrap gap-2">

                {selected.cyclomaticComplexity !==
                  null &&
                selected.cyclomaticComplexity !==
                  undefined && (

                  <span className="rounded border border-slate-700 bg-slate-800/30 px-2 py-1 text-[10px] text-slate-400">

                    Complexity:{" "}
                    {
                      selected.cyclomaticComplexity
                    }

                  </span>

                )}


                {selected.riskLevel && (

                  <span className="rounded border border-slate-700 bg-slate-800/30 px-2 py-1 text-[10px] text-slate-400">

                    Risk:{" "}
                    {
                      selected.riskLevel
                    }

                  </span>

                )}

              </div>

            </div>


            <button
              onClick={generate}
              disabled={
                generating ||
                !selected
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <FlaskConical className="h-4 w-4" />

              {generating
                ? "Generating..."
                : "Generate Targeted Tests"}

            </button>

          </div>


          {/* =================================================
              ERROR / BACKEND STATUS
          ================================================= */}

          {error && (

            <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">

              <div className="flex gap-3">

                <TriangleAlert className="h-4 w-4 shrink-0 text-amber-400" />

                <p className="text-xs leading-5 text-slate-400">
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              VALIDATION WARNING
          ================================================= */}

          <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">

            <div className="flex gap-3">

              <TriangleAlert className="h-4 w-4 shrink-0 text-amber-400" />

              <p className="text-xs leading-5 text-slate-400">

                Generated tests must be
                compiled and executed before
                they are treated as validated.
                An LLM response alone is not
                a PASS.

              </p>

            </div>

          </div>


          {/* =================================================
              GENERATED TEST
          ================================================= */}

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-[#101012]">

            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">

                <Terminal className="h-4 w-4 text-indigo-400" />

                Generated Test

              </div>


              <button
                onClick={
                  copyGeneratedTest
                }
                disabled={!generated}
                className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
              >

                {copied ? (

                  <Check className="h-3.5 w-3.5 text-emerald-400" />

                ) : (

                  <Copy className="h-3.5 w-3.5" />

                )}


                {copied
                  ? "Copied"
                  : "Copy"}

              </button>

            </div>


            <pre className="min-h-[260px] overflow-auto p-5 text-xs leading-6 text-emerald-300">

              {generated
                ? generated
                : "No generated test is available yet."}

            </pre>

          </div>


          {/* =================================================
              TEST STATUS
          ================================================= */}

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">


            <div className="rounded-lg border border-slate-800 bg-[#18181a] p-4">

              <div className="text-[9px] uppercase text-slate-500">
                Generation
              </div>

              <div className="mt-2 text-xs text-slate-400">

                {generated
                  ? "Available"
                  : "Not generated"}

              </div>

            </div>


            <div className="rounded-lg border border-slate-800 bg-[#18181a] p-4">

              <div className="text-[9px] uppercase text-slate-500">
                Compilation
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Not connected
              </div>

            </div>


            <div className="rounded-lg border border-slate-800 bg-[#18181a] p-4">

              <div className="text-[9px] uppercase text-slate-500">
                Execution
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Not connected
              </div>

            </div>

          </div>

        </section>

      )}

    </div>

  );

}