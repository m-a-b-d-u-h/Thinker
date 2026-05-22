"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useModule, useQuizQuestions, useSubmitQuiz } from "@/lib/query-hooks";
import type { QuizSubmitResponse } from "@/lib/types";

export default function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: module, isLoading: moduleLoading } = useModule(slug);
  const { data: questions = [], isLoading: questionsLoading } = useQuizQuestions(slug);
  const submitMutation = useSubmitQuiz();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [allAnswers, setAllAnswers] = useState<number[]>([]);

  const loading = moduleLoading || questionsLoading;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === (module?.questions?.[currentQuestion]?.correctAnswer ?? -1);
    if (isCorrect) setScore(s => s + 1);
    setAllAnswers(prev => [...prev, selectedAnswer]);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const res = await submitMutation.mutateAsync({ slug, answers: allAnswers });
      setResult(res);
    } catch {
      setResult({ score, total: questions.length, percentage: Math.round((score / questions.length) * 100), answers: [] });
    } finally {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setResult(null);
    setAllAnswers([]);
  };

  const percentage = Math.round((score / (questions.length || 1)) * 100);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!module || questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-16 text-center">
        <p className="text-[0.875rem] text-[#555]">Module or quiz questions not available.</p>
        <Link href="/models" className="inline-flex items-center gap-1.5 mt-4 text-[0.8125rem] text-[#888] hover:text-white transition-colors">
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-16">
      <div className="max-w-[700px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">{module.title}</h1>
          <p className="text-lg text-[#666]">Test your understanding of this module</p>
        </header>

        {!finished ? (
          <div>
            <div className="mb-6">
              <span className="text-[0.875rem] text-[#444]">Question {currentQuestion + 1} of {questions.length}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-8 leading-snug">
                  {questions[currentQuestion]?.question}
                </h2>

                <div className="flex flex-col gap-3 mb-8">
                  {questions[currentQuestion]?.options.map((option: string, idx: number) => {
                    const isCorrectOption = module.questions?.[currentQuestion]?.correctAnswer === idx;
                    const isWrongSelected = showResult && selectedAnswer === idx && !isCorrectOption;
                    const isCorrectSelected = showResult && selectedAnswer === idx && isCorrectOption;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        disabled={showResult}
                        className={`w-full text-left px-6 py-4 rounded-xl text-[1rem] border transition-all duration-200 ${
                          showResult
                            ? isCorrectOption
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : isWrongSelected
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-[#080808] border-white/5 text-[#888]'
                            : selectedAnswer === idx
                              ? 'bg-white/10 border-white/30 text-white'
                              : 'bg-[#080808] border-white/5 text-[#888] hover:border-white/20 hover:text-white'
                        } ${!showResult ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && isCorrectOption && <CheckCircle size={20} className="text-green-400 shrink-0" />}
                          {showResult && isWrongSelected && <XCircle size={20} className="text-red-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {!showResult ? (
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="w-full py-4 bg-white text-black rounded-xl font-bold text-[0.9375rem] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                Submit Answer
              </button>
            ) : (
              <div>
                <div className="mb-6 p-4 rounded-xl bg-[#0a0a0a] border border-white/5">
                  {module.questions?.[currentQuestion]?.explanation && (
                    <p className="text-[0.9375rem] text-[#888] leading-relaxed">
                      {module.questions[currentQuestion].explanation}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold text-[0.9375rem] cursor-pointer hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  {currentQuestion < questions.length - 1 ? (
                    <>Next Question <ArrowRight size={18} /></>
                  ) : (
                    <>See Results <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-black">{percentage}%</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {percentage >= 80 ? "Great job!" : percentage >= 50 ? "Good effort!" : "Keep practicing!"}
            </h2>
            <p className="text-lg text-[#666] mb-8">
              You got {result?.score ?? score} out of {result?.total ?? questions.length} correct
            </p>

            {result?.answers && result.answers.length > 0 && (
              <div className="text-left mb-8 space-y-3">
                {result.answers.map((a: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-xl border ${a.correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <p className="text-[0.875rem] text-white/80 mb-1">
                      <span className="font-bold">{a.correct ? "✓" : "✗"}</span> Question {idx + 1}
                    </p>
                    {a.explanation && <p className="text-[0.8125rem] text-[#888]">{a.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold cursor-pointer hover:bg-white/90 transition-all"
            >
              <RefreshCw size={18} />
              Retry Quiz
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
