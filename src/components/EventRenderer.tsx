import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, Check, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { EventData, FieldType, EventField } from '../types';
import { Button, Card } from './UI';

interface EventRendererProps {
  event: EventData;
  onSubmit?: (answers: Record<string, any>) => Promise<void>;
  previewMode?: boolean;
}

export const EventRenderer = ({ event, onSubmit, previewMode = false }: EventRendererProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); // New state for field errors

  // Helper validation function
  const validateField = (field: EventField, value: any): string | null => {
    if (field.required) {
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
        return `"${field.label}" is required`;
      }
    }

    // Heuristic Validations
    if (value && typeof value === 'string') {
      const labelLower = field.label.toLowerCase();
      // Email Validation
      if (labelLower.includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
      }
      // Phone/WhatsApp Validation
      if (labelLower.includes('phone') || labelLower.includes('whatsapp') || labelLower.includes('mobile')) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(value)) {
          return "Please enter a valid phone number (min 10 digits)";
        }
      }
    }
    return null;
  };

  const baseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';
  }, []);

  // Group fields into sections
  const sections = useMemo(() => {
    const allSections: { field: EventField | null; questions: EventField[] }[] = [];
    let currentSection: { field: EventField | null; questions: EventField[] } = {
      field: null,
      questions: []
    };

    event.fields.forEach(field => {
      if (field.type === FieldType.SECTION) {
        if (currentSection.questions.length > 0 || currentSection.field !== null) {
          allSections.push(currentSection);
        }
        currentSection = { field: field, questions: [] };
      } else {
        currentSection.questions.push(field);
      }
    });
    // Push the last section
    if (currentSection.questions.length > 0 || currentSection.field !== null) {
      allSections.push(currentSection);
    }

    // If no sections defined, treat as one big section
    if (allSections.length === 0 && event.fields.length > 0) {
      return [{ field: null, questions: event.fields }];
    }

    return allSections;
  }, [event.fields]);

  const activeSection = sections[currentSectionIndex] || sections[0];
  const isLastSection = currentSectionIndex === sections.length - 1;

  const handleNext = () => {
    setError(null);
    const newFieldErrors: Record<string, string> = {};
    let isValid = true;

    // Validate current section fields
    for (const field of activeSection.questions) {
      const errorMsg = validateField(field, answers[field.id]);
      if (errorMsg) {
        newFieldErrors[field.id] = errorMsg;
        isValid = false;
      }
    }

    if (!isValid) {
      setFieldErrors(newFieldErrors);
      setError("Please fix the errors before proceeding.");
      return;
    }

    // Clear errors if valid
    setFieldErrors({});

    // Logic Check
    let nextIndex = currentSectionIndex + 1;
    let autoSubmit = false;
    let logicTriggered = false;

    // Check strict logic from last answered question with logic
    for (const field of activeSection.questions) {
      if (field.logic && answers[field.id]) {
        const selectedOption = answers[field.id];
        // Logic maps option string -> destination ID
        // Determine if selectedOption matches a key in logic

        let destinationId: string | undefined;

        if (Array.isArray(selectedOption)) {
          // For checkbox (though logic usually disabled), check if any match
          // Not strictly supported for branching usually
        } else {
          destinationId = field.logic[String(selectedOption)];
        }

        if (destinationId) {
          logicTriggered = true; // Mark that question logic took precedence
          if (destinationId === 'SUBMIT') {
            autoSubmit = true;
          } else if (destinationId === 'NEXT') {
            // default behavior
          } else {
            // Find section index with this ID
            const targetIndex = sections.findIndex(s => s.field?.id === destinationId);
            if (targetIndex !== -1) {
              nextIndex = targetIndex;
            }
          }
        }
      }
    }

    // If no question logic, check section default logic
    if (!logicTriggered && activeSection.field?.logic?.default) {
      const def = activeSection.field.logic.default;
      if (def === 'SUBMIT') {
        autoSubmit = true;
      } else if (def === 'NEXT') {
        // default
      } else {
        const targetIndex = sections.findIndex(s => s.field?.id === def);
        if (targetIndex !== -1) {
          nextIndex = targetIndex;
        }
      }
    }

    if (autoSubmit) {
      handleSubmit(new Event('submit') as any);
      return;
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit(new Event('submit') as any);
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      // TODO: History stack for proper back on complex logic jumps?
      // simple default for now: -1
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewMode) {
      alert("This is a preview. No data will be saved.");
      return;
    }
    setError(null);

    // Final Global Validation
    const allFields = sections.flatMap(s => s.questions);
    const newFieldErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of allFields) {
      const errorMsg = validateField(field, answers[field.id]);
      if (errorMsg) {
        newFieldErrors[field.id] = errorMsg;
        isValid = false;
      }
    }

    if (!isValid) {
      setFieldErrors(newFieldErrors);
      setError("Please fix the errors in the form before submitting.");
      // Find index of first error to potentially navigate there (optional enhancement)
      return;
    }

    if (!onSubmit) return;

    setLoading(true);
    try {
      await onSubmit(answers);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  if (submitted && !previewMode) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full p-12 text-center bg-zinc-900/50">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-white/5 border border-white/10 mb-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-light text-white mb-4">Registration Confirmed</h2>
          <p className="text-zinc-500 mb-10 leading-relaxed">You have successfully registered for <br /><strong className="text-white font-medium">{event.title}</strong>.</p>

          {event.whatsappLink && (
            <div className="mb-6">
              <a
                href={event.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-colors w-full"
              >
                {/* WhatsApp Icon */}
                <svg viewBox="0 0 24 24" className="w-6 h-6 mr-2 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Join WhatsApp Group
              </a>
            </div>
          )}

          <Button onClick={() => window.location.reload()} variant="secondary" className="w-full">Register Another Person</Button>
        </Card>
      </div>
    );
  }

  const isClosed = event.status !== 'PUBLISHED' && !previewMode;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Event Header Card */}
      <div className="relative bg-zinc-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-10 mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {previewMode && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10">
            Preview Mode
          </div>
        )}

        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-widest uppercase text-zinc-400 mb-4">Event Registration</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">{event.title}</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center text-zinc-400 text-sm mb-8 space-y-3 sm:space-y-0 sm:space-x-8 font-mono">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(event.startDateTime).toLocaleDateString()}</span>
            <span className="mx-2 opacity-50">|</span>
            <span>{new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {event.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg font-light border-t border-white/5 pt-6">{event.description}</p>
      </div>

      {error && (
        <div className="bg-white/5 border border-white/20 rounded-xl p-4 mb-6 flex items-start">
          <AlertTriangle className="h-5 w-5 text-white mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-white">{error}</p>
        </div>
      )}

      {isClosed ? (
        <Card className="p-16 text-center">
          <div className="mb-4 text-zinc-600 uppercase tracking-widest text-xs font-bold">Status</div>
          <h2 className="text-2xl font-medium mb-2 text-white">Registration Closed</h2>
          <p className="text-zinc-500">This event is no longer accepting new registrations.</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">

          {/* Section Header */}
          {activeSection.field && (
            <div className="mb-6">
              <div className="bg-zinc-900 border-t-4 border-t-white border-x border-b border-white/10 rounded-lg p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold text-white">{activeSection.field.label}</h3>
                  <span className="text-xs font-mono text-zinc-500 border border-zinc-700 px-2 py-1 rounded">Page {currentSectionIndex + 1} of {sections.length}</span>
                </div>
                {activeSection.field.description && (
                  <p className="text-zinc-400">{activeSection.field.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Questions for Active Section */}
          {activeSection.questions.map(field => (
            <Card key={field.id} className="p-5 md:p-8 hover:bg-white/[0.02] transition-colors">
              {field.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={field.imageUrl}
                    alt="Question attachment"
                    className="w-full object-cover max-h-96"
                  />
                </div>
              )}

              <label className="block text-lg font-medium text-white mb-4">
                {field.label} {field.required && <span className="text-zinc-500 text-sm ml-1">(required)</span>}
              </label>

              {/* Render INPUTS based on type (same as before) */}
              {field.type === FieldType.SHORT_TEXT && (
                <input
                  required={field.required}
                  type="text"
                  className="appearance-none block w-full px-4 py-4 bg-black/40 border border-white/10 rounded-lg placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-white transition-all text-lg"
                  placeholder="Your answer..."
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              )}
              {field.type === FieldType.LONG_TEXT && (
                <textarea
                  required={field.required}
                  rows={3}
                  className="appearance-none block w-full px-4 py-4 bg-black/40 border border-white/10 rounded-lg placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-white transition-all text-lg"
                  placeholder="Your answer..."
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              )}
              {field.type === FieldType.DROPDOWN && (
                <div className="relative">
                  <select
                    required={field.required}
                    className="block w-full px-4 py-4 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white transition-all appearance-none text-lg"
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    value={answers[field.id] || ''}
                  >
                    <option value="" disabled className="text-zinc-600">Select an option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}

              {field.type === FieldType.CHECKBOX && (
                <div className="space-y-4">
                  {field.options?.map(opt => (
                    <label key={opt} className="flex items-center group cursor-pointer p-3 -ml-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={(answers[field.id] || []).includes(opt)}
                          className="peer h-6 w-6 bg-black border-2 border-zinc-700 rounded-md text-white focus:ring-0 focus:ring-offset-0 transition-all checked:bg-white checked:border-white appearance-none"
                          onChange={(e) => {
                            const current = answers[field.id] || [];
                            if (e.target.checked) {
                              handleInputChange(field.id, [...current, opt]);
                            } else {
                              handleInputChange(field.id, current.filter((v: string) => v !== opt));
                            }
                          }}
                        />
                        <Check className="absolute w-4 h-4 text-black left-1 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className="ml-4 block text-zinc-300 group-hover:text-white transition-colors text-lg">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {field.type === FieldType.MULTIPLE_CHOICE && (
                <div className="space-y-4">
                  {field.options?.map(opt => (
                    <label key={opt} className="flex items-center group cursor-pointer p-3 -ml-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={answers[field.id] === opt}
                        required={field.required}
                        className="h-6 w-6 bg-black border-2 border-zinc-700 rounded-full text-white focus:ring-0 focus:ring-offset-0 transition-all checked:bg-white checked:border-white appearance-none"
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                      <span className="ml-4 block text-zinc-300 group-hover:text-white transition-colors text-lg">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {field.type === FieldType.DATE && (
                <input
                  required={field.required}
                  type="date"
                  className="appearance-none block w-full px-4 py-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-white transition-all text-lg"
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              )}
              {field.type === FieldType.TIME && (
                <input
                  required={field.required}
                  type="time"
                  className="appearance-none block w-full px-4 py-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-white transition-all text-lg"
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              )}
              {field.type === FieldType.RATING && (
                <div className="flex gap-2">
                  {Array.from({ length: field.maxValue || 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleInputChange(field.id, i + 1)}
                      className="group"
                    >
                      <svg className={`w-10 h-10 transition-all ${answers[field.id] >= i + 1 ? 'fill-yellow-500' : 'fill-zinc-700 hover:fill-yellow-500/50'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              {field.type === FieldType.LINEAR_SCALE && (
                <div className="space-y-4">
                  <input
                    type="range"
                    min={field.minValue || 1}
                    max={field.maxValue || 5}
                    step="1"
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    value={answers[field.id] || (field.minValue || 1)}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>{field.minValue || 1}</span>
                    <span>{field.maxValue || 5}</span>
                  </div>
                </div>
              )}
              {field.type === FieldType.FILE_UPLOAD && (
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 md:p-8 text-center hover:border-zinc-500 transition-colors">
                  <input
                    type="file"
                    required={field.required}
                    accept={field.fileTypes?.join(',')}
                    className="hidden"
                    id={`file-${field.id}`}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // File Type Validation
                        if (field.fileTypes && field.fileTypes.length > 0) {
                          const ext = file.name.split('.').pop()?.toLowerCase();
                          const allowed = field.fileTypes.map(t => t.toLowerCase().replace('.', ''));
                          if (!ext || !allowed.includes(ext)) {
                            alert(`Invalid file type. Allowed: ${allowed.join(', ')}`);
                            e.target.value = ''; // Reset input
                            return;
                          }
                        }

                        if (field.maxFileSize && file.size > field.maxFileSize) {
                          alert(`File too large. Max size: ${(field.maxFileSize / 1048576).toFixed(1)}MB`);
                          return;
                        }

                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          // Upload file to backend
                          const res = await fetch(`${baseUrl}/upload/`, {
                            method: "POST",
                            body: formData,
                          });
                          if (!res.ok) throw new Error('Upload failed');
                          const data = await res.json();
                          // Save the filename returned by backend
                          handleInputChange(field.id, data.filename);
                        } catch (err) {
                          console.error("Upload failed", err);
                          alert("Failed to upload file. Please try again.");
                        }
                      }
                    }}
                  />
                  <label htmlFor={`file-${field.id}`} className="cursor-pointer">
                    <div className="text-zinc-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    {answers[field.id] ? (
                      answers[field.id].endsWith(".png") || answers[field.id].endsWith(".jpg") ? (
                        <img
                          src={`${baseUrl}/uploads/${answers[field.id]}`}
                          alt="Uploaded"
                          style={{ maxWidth: "150px", height: "auto" }}
                        />
                      ) : answers[field.id].endsWith(".pdf") ? (
                        <a
                          href={`${baseUrl}/uploads/${answers[field.id]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View PDF
                        </a>
                      ) : (
                        <p>{answers[field.id]}</p>
                      )
                    ) : (
                      <p>Click to upload</p>
                    )}
                    <p className="text-xs text-zinc-600">
                      {field.fileTypes?.join(', ') || 'Any file'} (max {((field.maxFileSize || 10485760) / 1048576).toFixed(0)}MB)
                    </p>
                  </label>
                </div>
              )}

              {field.description && (
                <p className="text-sm text-zinc-500 mt-2">{field.description}</p>
              )}
              {fieldErrors[field.id] && (
                <p className="text-sm text-red-500 mt-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors[field.id]}
                </p>
              )}
            </Card>
          ))}

          <div className="pt-8 pb-12 flex flex-col sm:flex-row items-center gap-4">
            {currentSectionIndex > 0 && (
              <Button type="button" onClick={handleBack} variant="secondary" className="w-full sm:flex-1 py-4 sm:py-5 text-lg font-bold" icon={ArrowLeft}>
                Back
              </Button>
            )}
            {!isLastSection ? (
              <Button type="button" onClick={handleNext} className="w-full sm:flex-[2] py-4 sm:py-5 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] tracking-wide">
                Next Step <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="w-full sm:flex-[2] py-4 sm:py-5 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] tracking-wide">
                {loading ? 'SUBMITTING...' : (previewMode ? 'SUBMIT REGISTRATION (PREVIEW)' : 'SUBMIT REGISTRATION')}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};