import React, { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Code2,
  FileCode2,
  FileWarning,
  FunctionSquare,
  Layers,
  Network,
  ShieldCheck,
  Terminal,
  Variable,
} from "lucide-react";


/* =========================================================
   HELPERS
========================================================= */

const displayValue = (value, suffix = "") => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return `${value}${suffix}`;
};


const riskClass = (risk) => {

  const value =
    String(risk || "").toUpperCase();


  if (value === "CRITICAL") {

    return "text-rose-300 bg-rose-400/10 border-rose-400/30";

  }


  if (value === "HIGH") {

    return "text-orange-300 bg-orange-400/10 border-orange-400/30";

  }


  if (value === "MEDIUM") {

    return "text-amber-300 bg-amber-400/10 border-amber-400/30";

  }


  if (value === "LOW") {

    return "text-emerald-300 bg-emerald-400/10 border-emerald-400/30";

  }


  return "text-slate-300 bg-slate-400/10 border-slate-400/20";

};


/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  icon: Icon,
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-[#151517] p-4">

      <div className="flex items-center justify-between">

        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </span>

        {Icon && (
          <Icon className="h-4 w-4 text-indigo-400" />
        )}

      </div>


      <div className="mt-2 font-mono text-2xl font-semibold text-slate-100">

        {displayValue(value)}

      </div>

    </div>

  );

}


/* =========================================================
   AST ANALYSIS PAGE
========================================================= */

export default function ASTAnalysisView({
  onNavigate,
  selectedFile: initialFile,
}) {

  const [result, setResult] =
    useState(null);

  const [selectedPath, setSelectedPath] =
    useState(initialFile || null);

  const [search, setSearch] =
    useState("");


  /* =======================================================
     LOAD REAL ANALYSIS
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
     UPDATE SELECTED FILE WHEN NAVIGATION CHANGES
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
     SEARCH
  ======================================================= */

  const filteredFiles =
    files.filter((file) => {

      const text = [
        file?.fileName,
        file?.filePath,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


      return text.includes(
        search.toLowerCase()
      );

    });


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
     NO ANALYSIS
  ======================================================= */

  if (!result) {

    return (

      <div className="mx-auto max-w-6xl p-6 text-slate-200">

        <div className="rounded-xl border border-dashed border-slate-700 bg-[#141415] p-16 text-center">

          <Code2 className="mx-auto h-10 w-10 text-slate-700" />

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

    <div className="mx-auto max-w-7xl space-y-5 p-6 text-slate-200">


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
          Static Code Investigation
        </p>


        <h1 className="mt-1 text-2xl font-bold">
          AST Analysis
        </h1>


        <p className="mt-1 text-sm text-slate-500">
          Investigate the files and methods
          identified by static analysis.
        </p>

      </header>


      {/* =================================================
          FILE LIST
      ================================================= */}

      <section className="rounded-xl border border-slate-800 bg-[#141415] p-5">

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-sm font-semibold">
              Repository Files
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a file to inspect its
              static-analysis results.
            </p>

          </div>


          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search files..."
            className="rounded-lg border border-slate-700 bg-[#1c1c1e] px-3 py-2 text-xs outline-none focus:border-indigo-500 md:w-64"
          />

        </div>


        {filteredFiles.length > 0 ? (

          <div className="grid gap-2">

            {filteredFiles.map(
              (file, index) => {

                const path =
                  file?.filePath ||
                  file?.fileName;


                const isSelected =
                  selectedPath === path;


                return (

                  <button
                    key={`${path}-${index}`}
                    onClick={() =>
                      setSelectedPath(
                        path
                      )
                    }
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-slate-800 bg-[#1a1a1c] hover:border-slate-600"
                    }`}
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <FileCode2 className="h-4 w-4 shrink-0 text-indigo-400" />

                      <div className="min-w-0">

                        <div className="truncate text-xs font-medium">
                          {
                            file?.fileName ||
                            file?.filePath ||
                            "Unnamed file"
                          }
                        </div>


                        {file?.filePath && (

                          <div className="mt-1 truncate text-[10px] text-slate-600">
                            {file.filePath}
                          </div>

                        )}

                      </div>

                    </div>


                    <div className="ml-3 flex shrink-0 items-center gap-2">

                      {file?.riskLevel && (

                        <span
                          className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase ${riskClass(
                            file.riskLevel
                          )}`}
                        >
                          {
                            file.riskLevel
                          }
                        </span>

                      )}


                      <span className="font-mono text-[10px] text-slate-500">

                        CC{" "}

                        {displayValue(
                          file?.cyclomaticComplexity
                        )}

                      </span>

                    </div>

                  </button>

                );

              }
            )}

          </div>

        ) : (

          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-xs text-slate-500">

            No files were returned by
            the current analysis.

          </div>

        )}

      </section>


      {/* =================================================
          SELECTED FILE
      ================================================= */}

      {selected ? (

        <div className="space-y-5">


          {/* =============================================
              FILE HEADER
          ============================================= */}

          <section className="rounded-xl border border-slate-800 bg-[#19191b] p-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="min-w-0">

                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                  Selected file
                </div>


                <h2 className="mt-1 truncate text-lg font-semibold">

                  {
                    selected.fileName ||
                    selected.filePath ||
                    "Unnamed file"
                  }

                </h2>


                {selected.filePath && (

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {selected.filePath}
                  </p>

                )}

              </div>


              <div className="flex items-center gap-2">

                {selected.riskLevel && (

                  <span
                    className={`rounded-md border px-3 py-1 text-[10px] font-bold uppercase ${riskClass(
                      selected.riskLevel
                    )}`}
                  >
                    {
                      selected.riskLevel
                    }
                  </span>

                )}


                <button
                  onClick={() =>
                    go(
                      "AI Test Generation",
                      {
                        selectedFile:
                          selected.filePath ||
                          selected.fileName,
                      }
                    )
                  }
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold hover:bg-indigo-500"
                >
                  Generate Tests
                </button>

              </div>

            </div>

          </section>


          {/* =============================================
              FILE METRICS
          ============================================= */}

          <section className="rounded-xl border border-slate-800 bg-[#19191b] p-5">

            <div className="mb-4">

              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Static Metrics
              </h3>

            </div>


            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

              <Metric
                label="Lines"
                value={
                  selected.linesOfCode
                }
                icon={FileCode2}
              />

              <Metric
                label="Classes"
                value={
                  selected.classCount
                }
                icon={Layers}
              />

              <Metric
                label="Methods"
                value={
                  selected.methodCount
                }
                icon={FunctionSquare}
              />

              <Metric
                label="Parameters"
                value={
                  selected.parameterCount
                }
                icon={Variable}
              />

              <Metric
                label="Variables"
                value={
                  selected.variableCount
                }
                icon={Variable}
              />

              <Metric
                label="Cyclomatic"
                value={
                  selected.cyclomaticComplexity
                }
                icon={Activity}
              />

              <Metric
                label="Cognitive"
                value={
                  selected.cognitiveComplexity
                }
                icon={Brain}
              />

              <Metric
                label="Max Nesting"
                value={
                  selected.maximumNestingDepth
                }
                icon={Network}
              />

              <Metric
                label="Longest Method"
                value={
                  selected.longestMethodLines !==
                    null &&
                  selected.longestMethodLines !==
                    undefined
                    ? `${selected.longestMethodLines} lines`
                    : null
                }
                icon={Terminal}
              />

            </div>

          </section>


          {/* =============================================
              FINDINGS + AST
          ============================================= */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">


            {/* FINDINGS */}

            <section className="rounded-xl border border-slate-800 bg-[#19191b] p-5">

              <div className="mb-4 flex items-center gap-2">

                <FileWarning className="h-4 w-4 text-amber-400" />

                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Findings
                </h3>

              </div>


              {Array.isArray(
                selected.codeSmells
              ) &&
              selected.codeSmells.length >
                0 ? (

                <div className="space-y-2">

                  {selected.codeSmells.map(
                    (smell, index) => (

                      <div
                        key={index}
                        className="flex gap-2 rounded-lg border border-slate-800 bg-[#151517] p-3 text-xs"
                      >

                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />

                        <span>
                          {smell}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="flex items-center gap-2 text-xs text-slate-500">

                  <ShieldCheck className="h-4 w-4" />

                  No file-level findings
                  were returned.

                </div>

              )}

            </section>


            {/* AST */}

            <section className="rounded-xl border border-slate-800 bg-[#19191b] p-5">

              <div className="mb-4 flex items-center gap-2">

                <Network className="h-4 w-4 text-indigo-400" />

                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  AST / Source Structure
                </h3>

              </div>


              <div className="rounded-lg border border-dashed border-slate-700 bg-[#111113] p-6 text-center">

                <Code2 className="mx-auto h-8 w-8 text-slate-700" />


                <p className="mt-3 text-sm text-slate-400">
                  AST/source data is not present
                  in the current scan response.
                </p>


                <p className="mt-2 text-xs leading-5 text-slate-600">
                  The frontend does not invent
                  source code or an AST tree.
                  A backend extraction endpoint
                  is required for this section.
                </p>

              </div>

            </section>

          </div>


          {/* =============================================
              INVESTIGATION PATH
          ============================================= */}

          <section className="rounded-xl border border-slate-800 bg-[#19191b] p-5">

            <div className="mb-3 flex items-center gap-2">

              <Terminal className="h-4 w-4 text-blue-400" />

              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Investigation Path
              </h3>

            </div>


            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">

              <div className="rounded-lg border border-slate-800 bg-[#151517] p-3">

                <div className="text-[9px] font-bold text-indigo-400">
                  01
                </div>

                <div className="mt-1 text-xs text-slate-300">
                  Risk identified
                </div>

              </div>


              <div className="rounded-lg border border-slate-800 bg-[#151517] p-3">

                <div className="text-[9px] font-bold text-indigo-400">
                  02
                </div>

                <div className="mt-1 text-xs text-slate-300">
                  Inspect AST
                </div>

              </div>


              <div className="rounded-lg border border-slate-800 bg-[#151517] p-3">

                <div className="text-[9px] font-bold text-indigo-400">
                  03
                </div>

                <div className="mt-1 text-xs text-slate-300">
                  Generate targeted tests
                </div>

              </div>


              <div className="rounded-lg border border-slate-800 bg-[#151517] p-3">

                <div className="text-[9px] font-bold text-indigo-400">
                  04
                </div>

                <div className="mt-1 text-xs text-slate-300">
                  Run and validate
                </div>

              </div>

            </div>

          </section>

        </div>

      ) : (

        <div className="rounded-xl border border-dashed border-slate-700 p-16 text-center text-xs text-slate-500">

          Select a file from the repository list.

        </div>

      )}

    </div>

  );

}