import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Code, Database, CheckCircle2, FileCode2, Copy, Check, Clock, ChevronRight, MessageSquare, Terminal, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ASTTestGeneratorView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [sourceCode, setSourceCode] = useState("");
  
  const [complexityScore, setComplexityScore] = useState(null);
  const [generatedTestCases, setGeneratedTestCases] = useState("");
  const [aiExplanation, setAiExplanation] = useState(""); 
  const [codeSmells, setCodeSmells] = useState([]);
  
  const [activeTab, setActiveTab] = useState("notes"); 
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const parseAIOutput = (rawText) => {
    if (!rawText) return { text: "Analysis complete.", code: "" };
    let extractedCode = [];
    let extractedText = rawText;
    const regex = /```(.*)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(rawText)) !== null) {
        const langTag = match[1].trim().toLowerCase();
        const blockContent = match[2].trim();
        if (langTag === "math" || langTag === "bash" || blockContent.length < 35) {
            extractedText = extractedText.replace(match[0], blockContent); 
        } else {
            extractedCode.push(blockContent);
            extractedText = extractedText.replace(match[0], ''); 
        }
    }
    extractedText = extractedText.replace(/#/g, '').replace(/\*\*/g, '').trim();
    return {
      text: extractedCode.length > 0 ? extractedText : "Analysis complete. No additional notes.",
      code: extractedCode.length > 0 ? extractedCode.join('\n\n// --- Next File/Module ---\n\n') : rawText
    };
  };

  useEffect(() => {
    const fetchDatabaseHistory = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/ast/history');
        if (response.ok) {
          const dbData = await response.json();
          const formattedHistory = dbData.map(item => {
            const parsed = parseAIOutput(item.testCases);
            const smellsArray = item.codeSmells ? item.codeSmells.split(', ') : ["No smells recorded"];
            return {
              id: item.id,
              language: item.language,
              code: item.sourceCode,
              complexity: item.complexityScore,
              testCases: parsed.code,
              explanation: parsed.text,
              smells: smellsArray,
              time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          setHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Could not load history:", error);
      }
    };
    fetchDatabaseHistory();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTestCases);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadHistoryItem = (item) => {
    setSelectedLanguage(item.language);
    setSourceCode(item.code);
    setComplexityScore(item.complexity);
    setGeneratedTestCases(item.testCases);
    setAiExplanation(item.explanation);
    setCodeSmells(item.smells || []);
    setActiveTab("notes"); 
    setShowResults(true);
  };

  const handleRunAnalysis = async () => {
    if (!sourceCode.trim()) {
      alert("Please provide source code for analysis.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8081/api/ast/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage, code: sourceCode })
      });
      if (response.ok) {
        const data = await response.json();
        const parsed = parseAIOutput(data.testCases);
        setComplexityScore(data.complexityScore);
        setGeneratedTestCases(parsed.code);
        setAiExplanation(parsed.text);
        setCodeSmells(data.codeSmells || ["Clean Code: No smells detected."]);
        setActiveTab("notes"); 
        setShowResults(true);
        const newRecord = {
          id: Date.now(),
          language: selectedLanguage,
          code: sourceCode,
          complexity: data.complexityScore,
          testCases: parsed.code,
          explanation: parsed.text,
          smells: data.codeSmells || ["Clean Code: No smells detected."],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [newRecord, ...prev]);
      } else {
        alert("Server error encountered. Check backend logs.");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Unable to reach the analysis server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplexityColor = (score) => {
    if (score === "AI Estimated") return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    const num = parseInt(score, 10);
    if (isNaN(num)) return "text-slate-400 bg-slate-400/10 border-slate-400/20"; // Safe fallback
    if (num <= 5) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (num <= 10) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-rose-400 bg-rose-400/10 border-rose-400/20";
  };

  const isCleanCode = (smell) => smell.toLowerCase().includes("clean code");

  // NEW: Hardened data processor that strips out NaN values safely
  const chartData = useMemo(() => {
    return history
      .filter(item => {
        const parsed = parseInt(item.complexity, 10);
        // Only keep records that successfully parse as real numbers
        return !isNaN(parsed) && item.complexity !== "AI Estimated";
      })
      .map(item => ({
        time: item.time,
        score: parseInt(item.complexity, 10)
      }))
      .reverse();
  }, [history]);

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-slate-200">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8 pb-5 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Automated Quality Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 font-medium tracking-wide">STATIC CODE ANALYSIS & TEST GENERATION</p>
        </div>
        {!isAnalyzing && !showResults && (
          <button 
            onClick={handleRunAnalysis}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-sm transition-all shadow-lg shadow-blue-900/20"
          >
            <Activity className="w-4 h-4" />
            Execute Analysis
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141415] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <FileCode2 className="w-4 h-4 text-blue-500" /> Source Input
            </h2>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Runtime Environment</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => { setSelectedLanguage(e.target.value); setShowResults(false); }}
                className="w-full bg-[#1c1c1e] border border-slate-700/50 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition-colors"
              >
                <optgroup label="Enterprise Backend">
                  <option value="Java">Java</option>
                  <option value="C#">C# (.NET)</option>
                  <option value="C++">C++</option>
                </optgroup>
                <optgroup label="Modern Systems">
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                </optgroup>
                <optgroup label="Web & Scripting">
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="PHP">PHP</option>
                  <option value="Ruby">Ruby</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Code Snippet</label>
              <textarea 
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="w-full h-48 bg-[#1c1c1e] border border-slate-700/50 text-slate-300 text-xs rounded-lg p-3 font-mono outline-none resize-none leading-relaxed focus:border-blue-500 transition-colors custom-scrollbar"
                placeholder={`// Input ${selectedLanguage} code here...`}
              />
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-[#141415] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-widest">
                <Clock className="w-4 h-4 text-indigo-400" /> Execution History
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left flex items-center justify-between p-3 bg-[#1c1c1e] border border-slate-700/30 rounded-lg hover:border-slate-500 hover:bg-[#232325] transition-all group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-300">{item.language} Module</div>
                      <div className="text-[10px] text-slate-500 mt-1">Score: {item.complexity} • {item.time}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-[#141415] border border-blue-500/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-blue-500 w-full animate-pulse"></div>
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Processing Request...</h2>
              <ul className="space-y-3 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-3"><Code className="w-4 h-4 text-blue-400" /> Building Abstract Syntax Tree...</li>
                <li className="flex items-center gap-3"><Activity className="w-4 h-4 text-indigo-400" /> Calculating execution paths...</li>
                <li className="flex items-center gap-3"><Database className="w-4 h-4 text-purple-400" /> Synthesizing test coverage...</li>
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2">
          {showResults ? (
            <div className="bg-[#141415] border border-slate-800/80 rounded-xl overflow-hidden h-full flex flex-col shadow-xl shadow-black/20">
              
              <div className="px-6 py-4 flex justify-between items-center bg-[#1c1c1e] border-b border-slate-800/80">
                <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Report Generated
                </h2>
              </div>

              <div className="flex border-b border-slate-800/80 bg-[#141415]">
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold tracking-wider uppercase transition-all ${activeTab === 'notes' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-[#1c1c1e]' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a1c]'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Analytics Data
                </button>
                <button 
                  onClick={() => setActiveTab('tests')}
                  className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold tracking-wider uppercase transition-all ${activeTab === 'tests' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#1c1c1e]' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a1c]'}`}
                >
                  <Terminal className="w-4 h-4" /> Output Code
                </button>
              </div>
              
              <div className="flex-1 flex flex-col p-6 bg-[#141415] overflow-hidden">
                
                {activeTab === 'notes' && (
                  <div className="flex-1 overflow-auto flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="bg-[#1c1c1e] border border-slate-700/40 p-5 rounded-xl shadow-sm">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Structural Complexity</h3>
                        <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border font-mono text-2xl font-semibold ${getComplexityColor(complexityScore)}`}>
                          {/* NEW: Safe UI Rendering to prevent NaN crashing */}
                          {complexityScore !== null && !isNaN(Number(complexityScore)) 
                            ? complexityScore 
                            : (complexityScore || "N/A")}
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 mt-3">Cyclomatic paths detected</div>
                      </div>

                      <div className="bg-[#1c1c1e] border border-slate-700/40 p-5 rounded-xl shadow-sm">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-3.5 h-3.5" /> Static Findings
                        </h3>
                        <ul className="space-y-2.5 max-h-24 overflow-y-auto">
                          {codeSmells.map((smell, idx) => (
                            <li key={idx} className="text-xs font-medium text-slate-300 flex items-start gap-2.5 leading-relaxed">
                              {isCleanCode(smell) ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                              {smell}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-[#1c1c1e] border border-slate-700/40 p-6 rounded-xl flex-1 shadow-sm">
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">AI Evaluation Notes</h3>
                      <div className="text-[13px] text-slate-300 leading-loose whitespace-pre-wrap">
                        {aiExplanation}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="relative rounded-xl border border-slate-700/50 flex-1 flex flex-col overflow-hidden bg-[#1c1c1e] shadow-sm">
                    <div className="flex justify-between items-center px-5 py-3 border-b border-slate-800/80 bg-[#141415]">
                      <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-widest">Test Suite ({selectedLanguage})</span>
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors bg-slate-700/40 px-3 py-1.5 rounded-md hover:bg-slate-600/60"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-5 overflow-auto flex-1">
                      <pre className="text-[13px] font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
                        {generatedTestCases}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
                
              <div className="px-6 py-4 border-t border-slate-800/80 flex justify-end bg-[#141415]">
                <button 
                  onClick={() => { setShowResults(false); setSourceCode(""); }}
                  className="px-5 py-2.5 bg-[#1c1c1e] text-slate-200 rounded-md hover:bg-slate-800 text-xs font-bold tracking-wide transition-colors border border-slate-700"
                >
                  Clear & Start New Request
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full border border-slate-800/80 bg-[#141415] rounded-xl flex flex-col p-8 shadow-sm min-h-[400px]">
              
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#1c1c1e] p-2.5 rounded-lg border border-slate-700/50">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">System Analytics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Historical Cyclomatic Complexity trends</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="flex-1 bg-[#1c1c1e] rounded-xl border border-slate-700/40 p-5 shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#818cf8' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        name="Complexity Score"
                        stroke="#818cf8" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#1e1e1e', stroke: '#818cf8', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#818cf8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700/50 rounded-xl bg-[#1c1c1e]/50">
                  <Code className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-xs">No AST data available to chart.</p>
                  <p className="text-[10px] mt-1 text-slate-600">Run a Java analysis to generate metrics.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}