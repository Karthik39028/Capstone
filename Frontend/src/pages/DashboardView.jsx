import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Code2,
  FileCode2,
  FileWarning,
  Gauge,
  GitBranch,
  Layers,
  Network,
  RefreshCw,
  Search,
  Terminal,
} from "lucide-react";

const API = "http://localhost:8081";

/* =========================================================
   HELPERS
========================================================= */

const displayValue = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return `${value}${suffix}`;
};

const riskClass = (risk) => {
  const value = String(risk || "").toUpperCase();

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
   METRIC COMPONENT
========================================================= */

function Metric({ label, value, icon: Icon, hint }) {
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

      {hint && (
        <div className="mt-1 text-[10px] text-slate-500">
          {hint}
        </div>
      )}

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardView({ onNavigate }) {

  const [repoUrl, setRepoUrl] = useState("");

  const [result, setResult] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState("");

  const [system, setSystem] = useState(null);


  /* =======================================================
     LOAD LAST REAL ANALYSIS
  ======================================================= */

  useEffect(() => {

    try {

      const saved = localStorage.getItem(
        "latestAnalysisResult"
      );

      if (saved) {

        const parsed = JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          setResult(parsed);
        }

      }

    } catch (error) {

      console.error(
        "Could not load saved analysis:",
        error
      );

      localStorage.removeItem(
        "latestAnalysisResult"
      );

      setResult(null);

    }

  }, []);


  /* =======================================================
     SYSTEM STATUS
  ======================================================= */

  useEffect(() => {

    let alive = true;

    const loadSystemStatus = async () => {

      try {

        const response = await fetch(
          `${API}/api/system/status`
        );

        if (
          response.ok &&
          alive
        ) {

          const data = await response.json();

          setSystem(data);

        }

      } catch (error) {

        console.error(
          "System status unavailable:",
          error
        );

        if (alive) {
          setSystem(null);
        }

      }

    };


    loadSystemStatus();

    const timer = setInterval(
      loadSystemStatus,
      15000
    );


    return () => {

      alive = false;

      clearInterval(timer);

    };

  }, []);


  /* =======================================================
     RUN REPOSITORY ANALYSIS
  ======================================================= */

  const runAnalysis = async () => {

    setError("");

    const url = repoUrl.trim();


    if (!url) {

      setError(
        "Enter a GitHub repository URL."
      );

      return;

    }


    if (
      !url
        .toLowerCase()
        .startsWith(
          "https://github.com/"
        )
    ) {

      setError(
        "Please enter a valid GitHub repository URL."
      );

      return;

    }


    /*
     * Clear the previous result.
     *
     * This is important because the dashboard
     * must never show old metrics while a new
     * repository is being analyzed.
     */

    setAnalyzing(true);

    setResult(null);

    localStorage.removeItem(
      "latestAnalysisResult"
    );


    try {

      const response = await fetch(
        `${API}/api/analysis/scan`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            repoUrl: url,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Repository analysis failed."
        );

      }


      /*
       * Only backend data is stored.
       */

      setResult(data);

      localStorage.setItem(
        "latestAnalysisResult",
        JSON.stringify(data)
      );

    } catch (error) {

      console.error(
        "Repository analysis error:",
        error
      );

      setError(
        error.message ||
        "Unable to reach the analysis server."
      );

    } finally {

      setAnalyzing(false);

    }

  };


  /* =======================================================
     BACKEND DATA
  ======================================================= */

  const files = Array.isArray(
    result?.files
  )
    ? result.files
    : [];


  const smells = Array.isArray(
    result?.codeSmells
  )
    ? result.codeSmells
    : null;


  /* =======================================================
     HIGH-RISK FILES
  ======================================================= */

  const riskyFiles = useMemo(() => {

    return [...files]

      .filter((file) => {

        const risk =
          String(
            file?.riskLevel || ""
          ).toUpperCase();

        return [
          "HIGH",
          "CRITICAL",
          "MEDIUM",
        ].includes(risk);

      })

      .sort((a, b) => {

        const complexityA =
          Number(
            a?.cyclomaticComplexity
          );

        const complexityB =
          Number(
            b?.cyclomaticComplexity
          );

        if (
          !Number.isFinite(
            complexityA
          )
        ) {
          return 1;
        }

        if (
          !Number.isFinite(
            complexityB
          )
        ) {
          return -1;
        }

        return (
          complexityB -
          complexityA
        );

      })

      .slice(0, 5);

  }, [files]);


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
     HEALTH SCORE
     
     This is calculated ONLY when the backend
     actually returns healthScore.
  ======================================================= */

  const healthValue =
    result?.healthScore;


  const numericHealth =
    Number(healthValue);


  const hasHealthScore =
    healthValue !== null &&
    healthValue !== undefined &&
    healthValue !== "" &&
    Number.isFinite(
      numericHealth
    );


  let healthLabel = "—";


  if (hasHealthScore) {

    if (numericHealth >= 85) {

      healthLabel =
        "Healthy";

    } else if (
      numericHealth >= 70
    ) {

      healthLabel =
        "Attention needed";

    } else if (
      numericHealth >= 50
    ) {

      healthLabel =
        "High attention";

    } else {

      healthLabel =
        "Critical attention";

    }

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="mx-auto max-w-7xl space-y-6 p-6 text-slate-200">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex flex-col gap-3 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Automated Quality Monitor
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Project Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Code quality, deployment context and
            application health in one place.
          </p>

        </div>


        {result && (

          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#171719] px-4 py-2 text-xs font-semibold hover:bg-[#202024] disabled:opacity-50"
          >

            <RefreshCw
              className={`h-4 w-4 ${
                analyzing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Analyze Again

          </button>

        )}

      </header>


      {/* =================================================
          REPOSITORY
      ================================================= */}

      <section className="rounded-xl border border-slate-800 bg-[#141415] p-5">

        <div className="mb-3 flex items-center gap-2">

          <GitBranch className="h-4 w-4 text-indigo-400" />

          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Repository
          </h2>

        </div>


        <div className="flex flex-col gap-3 lg:flex-row">

          <input
            value={repoUrl}
            onChange={(event) =>
              setRepoUrl(
                event.target.value
              )
            }
            onKeyDown={(event) => {

              if (
                event.key === "Enter"
              ) {
                runAnalysis();
              }

            }}
            placeholder="Enter GitHub repository URL"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#1c1c1e] px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />


          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Search className="h-4 w-4" />

            {analyzing
              ? "Analyzing..."
              : "Analyze Repository"}

          </button>

        </div>


        {error && (

          <p className="mt-3 text-xs text-rose-400">
            {error}
          </p>

        )}


        {result?.repository && (

          <p className="mt-2 truncate text-[11px] text-slate-500">
            {result.repository}
          </p>

        )}

      </section>


      {/* =================================================
          ANALYSIS PROGRESS
      ================================================= */}

      {analyzing && (

        <section className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">

          <div className="flex items-center gap-3 text-sm text-indigo-200">

            <Activity className="h-5 w-5 animate-pulse" />

            Cloning repository, parsing source files
            and calculating quality metrics...

          </div>

        </section>

      )}


      {/* =================================================
          NO ANALYSIS
      ================================================= */}

      {!result && !analyzing && (

        <section className="rounded-xl border border-dashed border-slate-700 bg-[#141415] p-16 text-center">

          <BarChart3 className="mx-auto h-10 w-10 text-slate-700" />

          <h2 className="mt-4 text-lg font-semibold text-slate-300">
            Analyze a repository to begin
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-slate-500">
            No project metrics are shown until
            the backend returns an analysis result.
          </p>

        </section>

      )}


      {/* =================================================
          REAL ANALYSIS RESULT
      ================================================= */}

      {result && (

        <>

          {/* =============================================
              HEALTH + STATIC METRICS
          ============================================= */}

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_2fr]">


            {/* HEALTH */}

            <div className="rounded-xl border border-slate-800 bg-[#141415] p-6">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Project Health
                </span>

                <Gauge className="h-5 w-5 text-indigo-400" />

              </div>


              <div className="mt-4 flex items-end gap-2">

                <span className="font-mono text-5xl font-bold">

                  {hasHealthScore
                    ? numericHealth
                    : "—"}

                </span>


                {hasHealthScore && (

                  <span className="mb-1 text-sm text-slate-500">
                    / 100
                  </span>

                )}

              </div>


              <p className="mt-2 text-sm font-semibold text-slate-300">

                {healthLabel}

              </p>


              {hasHealthScore && (

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          numericHealth
                        )
                      )}%`,
                    }}
                  />

                </div>

              )}


              <div className="mt-5 flex flex-wrap gap-2">

                {result.riskLevel && (

                  <span
                    className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${riskClass(
                      result.riskLevel
                    )}`}
                  >

                    {result.riskLevel} risk

                  </span>

                )}


                {smells !== null && (

                  <span className="rounded-md border border-slate-700 bg-slate-800/30 px-2 py-1 text-[10px] text-slate-400">

                    {smells.length} findings

                  </span>

                )}

              </div>

            </div>


            {/* STATIC METRICS */}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

              <Metric
                label="Lines of Code"
                value={
                  result.totalLinesOfCode
                }
                icon={FileCode2}
              />

              <Metric
                label="Classes"
                value={
                  result.totalClasses
                }
                icon={Layers}
              />

              <Metric
                label="Methods"
                value={
                  result.totalMethods
                }
                icon={Code2}
              />

              <Metric
                label="Issues"
                value={
                  smells !== null
                    ? smells.length
                    : null
                }
                icon={FileWarning}
              />

              <Metric
                label="Cyclomatic"
                value={
                  result.totalCyclomaticComplexity
                }
                icon={Activity}
              />

              <Metric
                label="Cognitive"
                value={
                  result.totalCognitiveComplexity
                }
                icon={Brain}
              />

              <Metric
                label="Max Nesting"
                value={
                  result.maximumNestingDepth
                }
                icon={Network}
              />

              <Metric
                label="Longest Method"
                value={
                  result.longestMethodLines !==
                    null &&
                  result.longestMethodLines !==
                    undefined
                    ? `${result.longestMethodLines} lines`
                    : null
                }
                icon={Terminal}
              />

            </div>

          </section>


          {/* =============================================
              NEEDS ATTENTION
          ============================================= */}

          <section className="rounded-xl border border-slate-800 bg-[#141415] p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold">
                  Needs Attention
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Higher-risk files identified by
                  the current static analysis.
                </p>

              </div>


              <button
                onClick={() =>
                  go("AST Analysis")
                }
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Open AST Analysis →
              </button>

            </div>


            {riskyFiles.length > 0 ? (

              <div className="space-y-2">

                {riskyFiles.map(
                  (file, index) => {

                    const path =
                      file.filePath ||
                      file.fileName ||
                      `file-${index}`;


                    return (

                      <button
                        key={`${path}-${index}`}
                        onClick={() =>
                          go(
                            "AST Analysis",
                            {
                              selectedFile:
                                path,
                            }
                          )
                        }
                        className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-[#1a1a1c] p-3 text-left hover:border-slate-600"
                      >

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            {file.riskLevel && (

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

                            <span className="truncate text-sm font-medium text-slate-200">

                              {
                                file.fileName ||
                                file.filePath ||
                                "Unnamed file"
                              }

                            </span>

                          </div>


                          {file.filePath && (

                            <p className="mt-1 truncate text-[10px] text-slate-500">
                              {file.filePath}
                            </p>

                          )}

                        </div>


                        <div className="ml-4 shrink-0 text-right text-[10px] text-slate-400">

                          <div>
                            Complexity{" "}
                            <b className="font-mono text-slate-200">
                              {displayValue(
                                file.cyclomaticComplexity
                              )}
                            </b>
                          </div>

                          <div className="mt-1">
                            Methods{" "}
                            <b className="font-mono text-slate-200">
                              {displayValue(
                                file.methodCount
                              )}
                            </b>
                          </div>

                        </div>

                      </button>

                    );

                  }
                )}

              </div>

            ) : (

              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-xs text-slate-500">
                No high-risk files were returned
                by the analysis.
              </div>

            )}

          </section>


          {/* =============================================
              APPLICATION + SYSTEM
          ============================================= */}

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">


            {/* APPLICATION HEALTH */}

            <div className="rounded-xl border border-slate-800 bg-[#141415] p-5">

              <h2 className="text-sm font-semibold">
                Application Health
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Runtime monitoring will connect here.
              </p>


              <div className="mt-4 grid grid-cols-2 gap-3">

                {[
                  "CPU",
                  "Memory",
                  "API Latency",
                  "HTTP Errors",
                  "Threads",
                  "DB Connections",
                ].map((metric) => (

                  <div
                    key={metric}
                    className="rounded-lg border border-slate-800 bg-[#1a1a1c] p-3"
                  >

                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      {metric}
                    </div>

                    <div className="mt-2 font-mono text-lg text-slate-600">
                      Not connected
                    </div>

                  </div>

                ))}

              </div>


              <div className="mt-4 rounded-lg border border-dashed border-slate-700 p-3 text-[10px] text-slate-500">

                Planned flow:

                <br />

                Spring Boot Actuator → Micrometer
                → Prometheus → Dashboard / Grafana

              </div>

            </div>


            {/* SYSTEM STATUS */}

            <div className="rounded-xl border border-slate-800 bg-[#141415] p-5">

              <h2 className="text-sm font-semibold">
                System Status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current backend status, when available.
              </p>


              <div className="mt-4 rounded-lg border border-slate-800 bg-[#1a1a1c] p-4">

                {system ? (

                  <pre className="overflow-auto text-xs text-slate-300">
                    {JSON.stringify(
                      system,
                      null,
                      2
                    )}
                  </pre>

                ) : (

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <AlertTriangle className="h-4 w-4" />

                    System status unavailable.

                  </div>

                )}

              </div>


              <button
                onClick={() =>
                  go(
                    "AI Test Generation"
                  )
                }
                className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >

                <Terminal className="h-4 w-4" />

                Open AI Test Generation

              </button>

            </div>

          </section>


          {/* =============================================
              RECENT QUALITY EVENTS
          ============================================= */}

          <section className="rounded-xl border border-slate-800 bg-[#141415] p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold">
                  Recent Quality Events
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Events returned from the current analysis.
                </p>

              </div>


              <button
                onClick={() =>
                  go("Quality Logs")
                }
                className="text-xs font-semibold text-indigo-400"
              >
                View Logs →
              </button>

            </div>


            <div className="space-y-2">


              {result.status && (

                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#1a1a1c] p-3 text-xs">

                  <Activity className="h-4 w-4 text-indigo-400" />

                  Analysis status:

                  <span className="font-mono">
                    {result.status}
                  </span>

                </div>

              )}


              {result.highestRiskMethod && (

                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#1a1a1c] p-3 text-xs">

                  <AlertTriangle className="h-4 w-4 text-amber-400" />

                  Highest-risk method:

                  <span className="font-mono text-slate-200">
                    {
                      result.highestRiskMethod
                    }
                  </span>

                </div>

              )}


              {smells &&
                smells
                  .slice(0, 3)
                  .map(
                    (smell, index) => (

                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#1a1a1c] p-3 text-xs"
                      >

                        <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

                        <span>
                          {smell}
                        </span>

                      </div>

                    )
                  )}


              {!result.status &&
                !result.highestRiskMethod &&
                !smells?.length && (

                  <div className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-xs text-slate-500">

                    No additional quality events
                    were returned.

                  </div>

                )}

            </div>

          </section>

        </>

      )}

    </div>

  );

}