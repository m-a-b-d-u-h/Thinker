"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Play } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useModule, useQuizQuestions, useSubmitQuiz, useSaveQuizProgress, useQuizProgress } from "@/lib/query-hooks";
import type { QuizSubmitResponse } from "@/lib/types";

type Answer = { questionId: string; selectedAnswer: number };

export default function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: module, isLoading: moduleLoading } = useModule(slug);
  const { data: questions = [], isLoading: questionsLoading } = useQuizQuestions(slug);
  const { data: savedProgress, isLoading: progressLoading } = useQuizProgress(slug);
  const submitMutation = useSubmitQuiz();
  const saveProgressMutation = useSaveQuizProgress();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResume, setShowResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pendingSubmitRef = useRef<Answer[] | null>(null);
  const initializedRef = useRef(false);
  const submittedRef = useRef(false);

  const loading = moduleLoading || questionsLoading || progressLoading;

  useEffect(() => {
    if (initializedRef.current || questions.length === 0) return;
    initializedRef.current = true;

    if (savedProgress) {
      const savedAnswers = savedProgress.answers ?? [];
      const answeredCount = savedAnswers.length;
      setAnswers(savedAnswers);
      const nextQuestion = Math.min(answeredCount, questions.length - 1);
      setCurrentQuestion(nextQuestion);
      setScore(savedProgress.score);

      if (answeredCount >= questions.length && !finished) {
        pendingSubmitRef.current = savedAnswers;
        setShowResume(false);
      } else if (answeredCount > 0) {
        setShowResume(true);
      }
    }
  }, [savedProgress, questions, finished]);

  useEffect(() => {
    if (pendingSubmitRef.current) {
      const ans = pendingSubmitRef.current;
      pendingSubmitRef.current = null;
      setSubmitting(true);
      submitWithAnswers(ans);
    }
  }, [answers, questions]);

  const autoSave = useCallback((currentAnswers: Answer[], questionIndex: number) => {
    saveProgressMutation.mutate({ slug, answers: currentAnswers, currentQuestion: questionIndex });
  }, [slug, saveProgressMutation]);

  const submitWithAnswers = async (submitAnswers: Answer[]) => {
    try {
      const res = await submitMutation.mutateAsync({ slug, answers: submitAnswers });
      setResult(res);
    } catch {
      const s = submitAnswers.reduce((acc, a) => {
        const isCorrect = a.selectedAnswer === (module?.questions?.find((_, i) => questions[i]?.id === a.questionId)?.correctAnswer ?? -1);
        return acc + (isCorrect ? 1 : 0);
      }, 0);
      setResult({ score: s, total: questions.length, percentage: Math.round((s / questions.length) * 100), answers: [] });
    } finally {
      setFinished(true);
      setSubmitting(false);
    }
  };

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleResume = () => {
    setShowResume(false);
  };

  const handleNext = () => {
    if (selectedAnswer === null || submitting || submittedRef.current) return;
    submittedRef.current = true;

    const question = questions[currentQuestion];
    if (!question) return;

    const isCorrect = selectedAnswer === (module?.questions?.[currentQuestion]?.correctAnswer ?? -1);
    if (isCorrect) setScore(s => s + 1);

    const newAnswer: Answer = { questionId: question.id, selectedAnswer };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setShowResult(true);

    autoSave(newAnswers, currentQuestion);
  };

  const handleContinue = () => {
    if (submitting) return;
    submittedRef.current = false;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setSubmitting(true);
      submitQuiz();
    }
  };

  const submitQuiz = () => {
    submitWithAnswers(answers);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setResult(null);
    setAnswers([]);
    setShowResume(false);
    setSubmitting(false);
    submittedRef.current = false;
  };

  const handleStartFresh = () => {
    setShowResume(false);
    setAnswers([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    submittedRef.current = false;
  };

  const percentage = Math.round((score / (questions.length || 1)) * 100);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" />
      </div>
    );
  }

  if (!module || questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16 text-center">
        <p className="text-[0.875rem] text-muted">Module or quiz questions not available.</p>
        <Link href="/models" className="inline-flex items-center gap-1.5 mt-4 text-[0.8125rem] text-muted hover:text-fg transition-colors">
          Back to library
        </Link>
      </div>
    );
  }

  if (showResume) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16">
        <div className="max-w-[500px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-6">
            <Play size={28} className="text-premium ml-1" />
          </div>
          <h2 className="text-2xl font-bold text-fg mb-2">Continue Quiz?</h2>
          <p className="text-[0.9375rem] text-muted mb-2">
            You have an incomplete quiz for <strong>{module.title}</strong>.
          </p>
          <p className="text-[0.8125rem] text-muted-dark mb-8">
            {savedProgress?.answers?.length ?? 0} of {questions.length} questions answered
            {" · "}{savedProgress?.score ?? 0} correct so far
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleResume}
              className="w-full py-4 bg-fg text-bg rounded-xl font-bold text-[0.9375rem] cursor-pointer hover:opacity-90 transition-all"
            >
              Resume Quiz
            </button>
            <button
              onClick={handleStartFresh}
              className="w-full py-4 bg-bg-card text-muted rounded-xl font-bold text-[0.9375rem] cursor-pointer border border-border-subtle hover:border-border hover:text-fg transition-all"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16">
      <div className="max-w-[700px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-fg mt-4 mb-2">{module.title}</h1>
          <p className="text-lg text-muted">Test your understanding of this module</p>
        </header>

        {!finished ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[0.875rem] text-muted-dark">Question {currentQuestion + 1} of {questions.length}</span>
              {answers.length > 0 && (
                <span className="text-[0.75rem] text-muted-dark">Auto-saving...</span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-fg mb-8 leading-snug">
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
                                : 'bg-bg-card border-border-subtle text-muted'
                            : selectedAnswer === idx
                              ? 'bg-bg-elevated border-border text-fg'
                              : 'bg-bg-card border-border-subtle text-muted hover:border-border hover:text-fg'
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
                disabled={selectedAnswer === null || submitting}
                className="w-full py-4 bg-fg text-bg rounded-xl font-bold text-[0.9375rem] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            ) : (
              <div>
                <div className="mb-6 p-4 rounded-xl bg-bg-card border border-border-subtle">
                  {module.questions?.[currentQuestion]?.explanation && (
                    <p className="text-[0.9375rem] text-muted leading-relaxed">
                      {module.questions[currentQuestion].explanation}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  disabled={submitting}
                  className="w-full py-4 bg-fg text-bg rounded-xl font-bold text-[0.9375rem] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? "Submitting..." : currentQuestion < questions.length - 1 ? (
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
            <div className="w-24 h-24 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-black">{result?.percentage ?? percentage}%</span>
            </div>
            <h2 className="text-3xl font-bold text-fg mb-2">
              {percentage >= 80 ? "Great job!" : percentage >= 50 ? "Good effort!" : "Keep practicing!"}
            </h2>
            <p className="text-lg text-muted mb-8">
              You got {result?.score ?? score} out of {result?.total ?? questions.length} correct
            </p>

            {result?.answers && result.answers.length > 0 && (
              <div className="text-left mb-8 space-y-3">
                {result.answers.map((a: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-xl border ${a.correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <p className="text-[0.875rem] text-fg/80 mb-1">
                      <span className="font-bold">{a.correct ? "✓" : "✗"}</span> Question {idx + 1}
                    </p>
                    {a.explanation && <p className="text-[0.8125rem] text-muted">{a.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-8 py-4 bg-fg text-bg rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all"
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
