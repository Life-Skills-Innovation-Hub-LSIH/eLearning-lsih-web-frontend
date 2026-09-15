"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
  Layers,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/admin/shadcn";
import { fetchCourse } from "../api/courses-api";
import {
  createLessonApi,
  createModuleApi,
  createQuizApi,
  deleteLessonApi,
  deleteModuleApi,
  deleteQuizApi,
  fetchCourseModules,
  updateLessonApi,
  updateModuleApi,
} from "../api/course-content-api";
import { AdminFormField, AdminFormInput, AdminFormSection } from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";
import { LessonMediaUploadField } from "./LessonMediaUploadField";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import type {
  CoursePublishStatus,
  LessonContentType,
  ManagedCourse,
  ManagedLesson,
  ManagedModule,
  ManagedQuiz,
  ManagedQuizQuestion,
  QuizQuestionType,
} from "@/shared/types";

type Props = {
  courseId: string;
};

const statusItems = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const contentTypeItems = [
  { value: "video", label: "Video" },
  { value: "file", label: "PDF" },
  { value: "text", label: "Text only" },
];

function emptyQuestion(): ManagedQuizQuestion {
  return {
    questionText: "",
    type: "multiple_choice",
    position: 1,
    options: [
      { optionText: "", isCorrect: true, position: 1 },
      { optionText: "", isCorrect: false, position: 2 },
    ],
  };
}

export function CourseContentManager({ courseId }: Props) {
  const router = useRouter();
  const { token } = useAuth();
  const [course, setCourse] = useState<ManagedCourse | null>(null);
  const [modules, setModules] = useState<ManagedModule[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleStatus, setModuleStatus] = useState<CoursePublishStatus>("draft");
  const [savingModule, setSavingModule] = useState(false);

  async function load() {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [courseData, moduleList] = await Promise.all([
        fetchCourse(token, courseId),
        fetchCourseModules(token, courseId, true),
      ]);
      setCourse(courseData);
      setModules(moduleList);
      if (!expandedId && moduleList[0]) setExpandedId(moduleList[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

  async function onCreateModule(event: FormEvent) {
    event.preventDefault();
    if (!token || !moduleTitle.trim()) return;
    setSavingModule(true);
    setError("");
    setSuccess("");
    try {
      const created = await createModuleApi(token, courseId, {
        title: moduleTitle.trim(),
        description: moduleDescription.trim() || null,
        status: moduleStatus,
      });
      setModules((prev) => [...prev, created]);
      setExpandedId(created.id);
      setModuleTitle("");
      setModuleDescription("");
      setModuleStatus("draft");
      setSuccess("Module created.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(Object.values(err.body?.errors ?? {})[0]?.[0] ?? err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create module.");
      }
    } finally {
      setSavingModule(false);
    }
  }

  async function onDeleteModule(module: ManagedModule) {
    if (!token) return;
    if (!window.confirm(`Delete module "${module.title}" and all its lessons/quizzes?`)) return;
    try {
      await deleteModuleApi(token, module.id);
      setModules((prev) => prev.filter((item) => item.id !== module.id));
      if (expandedId === module.id) setExpandedId(null);
      setSuccess("Module deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete module.");
    }
  }

  function replaceModule(updated: ManagedModule) {
    setModules((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
  }

  if (loading) {
    return (
      <div className="admin-page">
        <PageLoader label="Loading course content…" />
      </div>
    );
  }

  return (
    <AdminPageLayout
      title={course ? `Content · ${course.title}` : "Course content"}
      description="Add modules, then lessons and quizzes inside each module."
      backHref="/admin/courses"
      backLabel="Back to courses"
      actions={
        course ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
          >
            Edit course
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        <AdminFormSection
          icon={Layers}
          title="Add module"
          description="Modules are sections of the course (e.g. Week 1)."
        >
          <form onSubmit={onCreateModule} className="grid gap-4 sm:grid-cols-2">
            <AdminFormField id="moduleTitle" label="Module title" required className="sm:col-span-2">
              <AdminFormInput
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Week 1 — Introduction"
                required
              />
            </AdminFormField>
            <AdminFormField id="moduleDescription" label="Description" className="sm:col-span-2">
              <textarea
                id="moduleDescription"
                className="admin-form-input min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Optional short description"
              />
            </AdminFormField>
            <AdminFormField id="moduleStatus" label="Status">
              <Select
                value={moduleStatus}
                onValueChange={(value) => setModuleStatus(value as CoursePublishStatus)}
                items={statusItems}
              >
                <SelectTrigger className="admin-form-input w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
            <div className="flex items-end">
              <Button type="submit" disabled={savingModule || !moduleTitle.trim()}>
                <Plus className="size-4" />
                {savingModule ? "Saving…" : "Add module"}
              </Button>
            </div>
          </form>
        </AdminFormSection>

        <AdminFormSection
          icon={BookOpen}
          title="Modules"
          description={
            modules.length
              ? `${modules.length} module${modules.length === 1 ? "" : "s"} in this course.`
              : "No modules yet. Create one above."
          }
        >
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create a module to start adding lessons.</p>
          ) : (
            <div className="space-y-3">
              {modules.map((module, moduleIndex) => {
                const open = expandedId === module.id;
                return (
                  <div key={module.id} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-3">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                        onClick={() => setExpandedId(open ? null : module.id)}
                      >
                        {open ? (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                          {moduleIndex + 1}
                        </span>
                        <span className="truncate font-medium">{module.title}</span>
                        <Badge variant="outline" className="shrink-0 font-normal">
                          {module.status}
                        </Badge>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {(module.lessons ?? []).length} lessons · {(module.quizzes ?? []).length}{" "}
                          quizzes
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => void onDeleteModule(module)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    {open ? (
                      <ModuleEditor
                        token={token!}
                        module={module}
                        onChange={replaceModule}
                        onError={setError}
                        onSuccess={setSuccess}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </AdminFormSection>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </div>
    </AdminPageLayout>
  );
}

function ModuleEditor({
  token,
  module,
  onChange,
  onError,
  onSuccess,
}: {
  token: string;
  module: ManagedModule;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? "");
  const [status, setStatus] = useState<CoursePublishStatus>(module.status);
  const [saving, setSaving] = useState(false);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonContentType>("video");
  const [lessonBody, setLessonBody] = useState("");
  const [lessonMedia, setLessonMedia] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonStatus, setLessonStatus] = useState<CoursePublishStatus>("draft");
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizPass, setQuizPass] = useState("70");
  const [quizStatus, setQuizStatus] = useState<CoursePublishStatus>("draft");
  const [questions, setQuestions] = useState<ManagedQuizQuestion[]>([emptyQuestion()]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);

  async function saveModule(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateModuleApi(token, module.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
      });
      onChange({ ...module, ...updated, lessons: module.lessons, quizzes: module.quizzes });
      onSuccess("Module updated.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update module.");
    } finally {
      setSaving(false);
    }
  }

  async function addLesson(event: FormEvent) {
    event.preventDefault();
    if (!lessonTitle.trim()) return;

    if ((lessonType === "video" || lessonType === "file") && !lessonMedia.trim()) {
      onError(lessonType === "video" ? "Please upload a video." : "Please upload a PDF.");
      return;
    }

    setSavingLesson(true);
    try {
      const created = await createLessonApi(token, module.id, {
        title: lessonTitle.trim(),
        contentType: lessonType,
        body: lessonBody.trim() || null,
        mediaUrl: lessonType === "text" ? null : lessonMedia.trim() || null,
        durationMinutes: lessonDuration ? Number(lessonDuration) : null,
        status: lessonStatus,
      });
      onChange({
        ...module,
        lessons: [...(module.lessons ?? []), created],
        lessonsCount: (module.lessonsCount ?? 0) + 1,
      });
      setLessonTitle("");
      setLessonBody("");
      setLessonMedia("");
      setLessonDuration("");
      setLessonType("video");
      setLessonStatus("draft");
      setLessonDialogOpen(false);
      onSuccess("Lesson created.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create lesson.");
    } finally {
      setSavingLesson(false);
    }
  }

  async function removeLesson(lesson: ManagedLesson) {
    if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await deleteLessonApi(token, lesson.id);
      onChange({
        ...module,
        lessons: (module.lessons ?? []).filter((item) => item.id !== lesson.id),
      });
      onSuccess("Lesson deleted.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete lesson.");
    }
  }

  async function toggleLessonStatus(lesson: ManagedLesson) {
    try {
      const updated = await updateLessonApi(token, lesson.id, {
        title: lesson.title,
        contentType: lesson.contentType,
        body: lesson.body,
        mediaUrl: lesson.mediaUrl,
        durationMinutes: lesson.durationMinutes,
        status: lesson.status === "published" ? "draft" : "published",
      });
      onChange({
        ...module,
        lessons: (module.lessons ?? []).map((item) => (item.id === lesson.id ? updated : item)),
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update lesson.");
    }
  }

  async function addQuiz(event: FormEvent) {
    event.preventDefault();
    if (!quizTitle.trim()) return;
    const cleaned = questions
      .map((question, index) => ({
        ...question,
        position: index + 1,
        questionText: question.questionText.trim(),
        options: question.options
          .map((option, optionIndex) => ({
            ...option,
            position: optionIndex + 1,
            optionText: option.optionText.trim(),
          }))
          .filter((option) => option.optionText),
      }))
      .filter((question) => question.questionText);

    if (cleaned.length === 0) {
      onError("Add at least one quiz question.");
      return;
    }

    setSavingQuiz(true);
    try {
      const created = await createQuizApi(token, module.id, {
        title: quizTitle.trim(),
        passScore: Number(quizPass) || 70,
        status: quizStatus,
        questions: cleaned,
      });
      onChange({
        ...module,
        quizzes: [...(module.quizzes ?? []), created],
        quizzesCount: (module.quizzesCount ?? 0) + 1,
      });
      setQuizTitle("");
      setQuizPass("70");
      setQuizStatus("draft");
      setQuestions([emptyQuestion()]);
      setQuizDialogOpen(false);
      onSuccess("Quiz created.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create quiz.");
    } finally {
      setSavingQuiz(false);
    }
  }

  async function removeQuiz(quiz: ManagedQuiz) {
    if (!window.confirm(`Delete quiz "${quiz.title}"?`)) return;
    try {
      await deleteQuizApi(token, quiz.id);
      onChange({
        ...module,
        quizzes: (module.quizzes ?? []).filter((item) => item.id !== quiz.id),
      });
      onSuccess("Quiz deleted.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete quiz.");
    }
  }

  return (
    <div className="space-y-8 border-t border-border p-4 sm:p-5">
      <form onSubmit={saveModule} className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
        <AdminFormInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module title"
          required
        />
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as CoursePublishStatus)}
          items={statusItems}
        >
          <SelectTrigger className="admin-form-input w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline" disabled={saving}>
          {saving ? "Saving…" : "Save module"}
        </Button>
        <textarea
          className="admin-form-input min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm sm:col-span-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Module description"
        />
      </form>

      <section className="overflow-hidden rounded-xl border border-sky-200/80 bg-sky-50/40 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/20">
        <div className="flex items-center justify-between gap-3 border-b border-sky-200/70 bg-sky-100/60 px-4 py-3 dark:border-sky-900/40 dark:bg-sky-950/40">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-600 text-white">
              <FileText className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Lessons</h3>
              <p className="text-xs text-muted-foreground">Videos, PDFs, or text inside this module</p>
            </div>
          </div>
          <Badge variant="outline" className="border-sky-300 bg-white/80 font-normal dark:border-sky-800 dark:bg-sky-950/60">
            {(module.lessons ?? []).length} lesson{(module.lessons ?? []).length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="space-y-4 p-4">
          {(module.lessons ?? []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-sky-200 bg-white/70 px-3 py-4 text-sm text-muted-foreground dark:border-sky-900/50 dark:bg-sky-950/30">
              No lessons in this module yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {(module.lessons ?? []).map((lesson, lessonIndex) => (
                <li
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                        {lessonIndex + 1}
                      </span>
                      {lesson.contentType === "video" ? (
                        <Video className="size-3.5 text-muted-foreground" />
                      ) : (
                        <FileText className="size-3.5 text-muted-foreground" />
                      )}
                      {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.contentType === "file" ? "PDF" : lesson.contentType}
                      {lesson.durationMinutes ? ` · ${lesson.durationMinutes} min` : ""}
                      {lesson.mediaUrl ? (
                        <>
                          {" · "}
                          <a
                            href={lesson.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            Open
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void toggleLessonStatus(lesson)}
                    >
                      {lesson.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void removeLesson(lesson)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                className="bg-sky-600 text-white hover:bg-sky-700"
                onClick={() => setLessonDialogOpen(true)}
              >
                <Plus className="size-4" />
                Add lesson
              </Button>
            </div>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-sky-600 text-white">
                    <FileText className="size-3.5" />
                  </span>
                  Add lesson
                </DialogTitle>
                <DialogDescription>
                  Create a video, PDF, or text lesson for this module.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={addLesson} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminFormInput
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Lesson title"
                    required
                  />
                  <Select
                    value={lessonType}
                    onValueChange={(value) => {
                      const next = value as LessonContentType;
                      setLessonType(next);
                      setLessonMedia("");
                    }}
                    items={contentTypeItems}
                  >
                    <SelectTrigger className="admin-form-input w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(lessonType === "video" || lessonType === "file") && (
                    <LessonMediaUploadField
                      token={token}
                      type={lessonType}
                      mediaUrl={lessonMedia || null}
                      slug={module.slug}
                      onChange={(url) => setLessonMedia(url ?? "")}
                    />
                  )}
                  <textarea
                    className="admin-form-input min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm sm:col-span-2"
                    value={lessonBody}
                    onChange={(e) => setLessonBody(e.target.value)}
                    placeholder="Lesson text / notes (optional)"
                  />
                  {lessonType === "video" ? (
                    <AdminFormInput
                      type="number"
                      min="0"
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(e.target.value)}
                      placeholder="Duration (minutes)"
                    />
                  ) : null}
                  <Select
                    value={lessonStatus}
                    onValueChange={(value) => setLessonStatus(value as CoursePublishStatus)}
                    items={statusItems}
                  >
                    <SelectTrigger className="admin-form-input w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="-mx-0 -mb-0 rounded-lg border bg-muted/40 sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLessonDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingLesson || !lessonTitle.trim()}>
                    <Plus className="size-4" />
                    {savingLesson ? "Saving…" : "Add lesson"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Then add quizzes
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <section className="overflow-hidden rounded-xl border border-violet-200/80 bg-violet-50/40 shadow-sm dark:border-violet-900/50 dark:bg-violet-950/20">
        <div className="flex items-center justify-between gap-3 border-b border-violet-200/70 bg-violet-100/60 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-950/40">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Quizzes</h3>
              <p className="text-xs text-muted-foreground">Questions to check understanding after lessons</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-violet-300 bg-white/80 font-normal dark:border-violet-800 dark:bg-violet-950/60"
          >
            {(module.quizzes ?? []).length} quiz{(module.quizzes ?? []).length === 1 ? "" : "zes"}
          </Badge>
        </div>

        <div className="space-y-4 p-4">
          {(module.quizzes ?? []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-violet-200 bg-white/70 px-3 py-4 text-sm text-muted-foreground dark:border-violet-900/50 dark:bg-violet-950/30">
              No quizzes in this module yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {(module.quizzes ?? []).map((quiz, quizIndex) => (
                <li
                  key={quiz.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
                >
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                        {quizIndex + 1}
                      </span>
                      {quiz.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pass {quiz.passScore}% · {(quiz.questions ?? []).length || quiz.questionsCount || 0}{" "}
                      questions · {quiz.status}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => void removeQuiz(quiz)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                className="bg-violet-600 text-white hover:bg-violet-700"
                onClick={() => setQuizDialogOpen(true)}
              >
                <Plus className="size-4" />
                Add quiz
              </Button>
            </div>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-violet-600 text-white">
                    <HelpCircle className="size-3.5" />
                  </span>
                  Add quiz
                </DialogTitle>
                <DialogDescription>
                  Build questions to check understanding after the lessons.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={addQuiz} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <AdminFormInput
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Quiz title"
                    required
                    className="sm:col-span-2"
                  />
                  <AdminFormInput
                    type="number"
                    min="0"
                    max="100"
                    value={quizPass}
                    onChange={(e) => setQuizPass(e.target.value)}
                    placeholder="Pass score %"
                  />
                </div>

                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="space-y-2 rounded-lg bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Question {questionIndex + 1}
                      </p>
                      <Select
                        value={question.type}
                        onValueChange={(value) => {
                          const type = value as QuizQuestionType;
                          setQuestions((prev) =>
                            prev.map((item, index) =>
                              index === questionIndex
                                ? {
                                    ...item,
                                    type,
                                    options:
                                      type === "true_false"
                                        ? [
                                            { optionText: "True", isCorrect: true, position: 1 },
                                            { optionText: "False", isCorrect: false, position: 2 },
                                          ]
                                        : item.options.length
                                          ? item.options
                                          : emptyQuestion().options,
                                  }
                                : item,
                            ),
                          );
                        }}
                        items={[
                          { value: "multiple_choice", label: "Multiple choice" },
                          { value: "true_false", label: "True / False" },
                        ]}
                      >
                        <SelectTrigger className="admin-form-input w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                          <SelectItem value="true_false">True / False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <AdminFormInput
                      value={question.questionText}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item, index) =>
                            index === questionIndex ? { ...item, questionText: e.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Question text"
                      required
                    />
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex cursor-pointer items-center gap-2">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) =>
                              setQuestions((prev) =>
                                prev.map((item, index) =>
                                  index === questionIndex
                                    ? {
                                        ...item,
                                        options: item.options.map((opt, oi) => ({
                                          ...opt,
                                          isCorrect:
                                            item.type === "true_false"
                                              ? oi === optionIndex
                                              : oi === optionIndex
                                                ? checked === true
                                                : opt.isCorrect,
                                        })),
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                          <AdminFormInput
                            value={option.optionText}
                            onChange={(e) =>
                              setQuestions((prev) =>
                                prev.map((item, index) =>
                                  index === questionIndex
                                    ? {
                                        ...item,
                                        options: item.options.map((opt, oi) =>
                                          oi === optionIndex
                                            ? { ...opt, optionText: e.target.value }
                                            : opt,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            disabled={question.type === "true_false"}
                            className="flex-1"
                          />
                        </label>
                      ))}
                      {question.type === "multiple_choice" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setQuestions((prev) =>
                              prev.map((item, index) =>
                                index === questionIndex
                                  ? {
                                      ...item,
                                      options: [
                                        ...item.options,
                                        {
                                          optionText: "",
                                          isCorrect: false,
                                          position: item.options.length + 1,
                                        },
                                      ],
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          Add option
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
                  >
                    Add question
                  </Button>
                  <Select
                    value={quizStatus}
                    onValueChange={(value) => setQuizStatus(value as CoursePublishStatus)}
                    items={statusItems}
                  >
                    <SelectTrigger className="admin-form-input w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="-mx-0 -mb-0 rounded-lg border bg-muted/40 sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQuizDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingQuiz || !quizTitle.trim()}>
                    <Plus className="size-4" />
                    {savingQuiz ? "Saving…" : "Add quiz"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
