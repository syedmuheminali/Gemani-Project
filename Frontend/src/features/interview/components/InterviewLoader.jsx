import React, { useState, useEffect } from 'react';
import './InterviewLoader.scss';

const PROCESS_STEPS = [
    { label: "Analyzing job description & core requirements", detail: "Extracting key technical skills, responsibilities & qualifications" },
    { label: "Scanning profile & identifying skill gaps", detail: "Evaluating domain expertise and matching role seniority" },
    { label: "Formulating technical & behavioral questions", detail: "Crafting targeted questions with intentions & model answers" },
    { label: "Constructing 7-day preparation roadmap", detail: "Designing daily focus areas and actionable study milestones" },
    { label: "Finalizing your custom interview strategy", detail: "Generating match score and comprehensive readiness plan" }
];

const InterviewLoader = ({ 
    title = "Preparing Your Interview Plan", 
    subtitle = "Our AI is crafting a personalized, comprehensive interview strategy." 
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Progress steps forward dynamically
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev < PROCESS_STEPS.length - 1 ? prev + 1 : prev));
        }, 3800);

        return () => clearInterval(interval);
    }, []);

    const progressPercentage = Math.min(95, Math.max(15, ((currentStep + 1) / PROCESS_STEPS.length) * 100));

    return (
        <main className="interview-loader-screen">
            {/* Background ambient lighting */}
            <div className="loader-glow loader-glow--primary" />
            <div className="loader-glow loader-glow--secondary" />

            <div className="loader-card">
                {/* AI Pulsing Orb Header */}
                <div className="loader-orb-wrapper">
                    <div className="orb-wave orb-wave--1" />
                    <div className="orb-wave orb-wave--2" />
                    <div className="orb-core">
                        <svg className="orb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                {/* Status Badge & Title */}
                <div className="loader-header">
                    <span className="loader-badge">
                        <span className="loader-badge__dot" />
                        AI Analysis In Progress
                    </span>
                    <h1 className="loader-title">{title}</h1>
                    <p className="loader-subtitle">{subtitle}</p>
                </div>

                {/* Glowing Progress Track */}
                <div className="loader-progress">
                    <div className="loader-progress__track">
                        <div 
                            className="loader-progress__fill" 
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="loader-progress__info">
                        <span>Step {currentStep + 1} of {PROCESS_STEPS.length}</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                </div>

                {/* Animated Steps Checklist */}
                <div className="loader-steps">
                    {PROCESS_STEPS.map((step, index) => {
                        const isDone = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <div 
                                key={index} 
                                className={`step-row ${isDone ? 'step-row--done' : isCurrent ? 'step-row--current' : 'step-row--pending'}`}
                            >
                                <div className="step-row__icon-container">
                                    {isDone ? (
                                        <div className="step-badge step-badge--done">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="step-badge step-badge--current">
                                            <span className="step-spinner" />
                                        </div>
                                    ) : (
                                        <div className="step-badge step-badge--pending">
                                            <span className="step-circle" />
                                        </div>
                                    )}
                                </div>

                                <div className="step-row__content">
                                    <h4 className="step-row__label">{step.label}</h4>
                                    {isCurrent && (
                                        <p className="step-row__detail">{step.detail}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Tip / Meta */}
                <div className="loader-footer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>We are generating tailored questions, interview intentions, and study roadmap.</span>
                </div>
            </div>
        </main>
    );
};

export default InterviewLoader;
