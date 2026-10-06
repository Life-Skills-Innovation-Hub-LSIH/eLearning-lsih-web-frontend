"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
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
  updateQuizApi,
} from "../api/course-content-api";
import { ActionMenu } from "./ActionMenu";
import { AdminFormField, AdminFormInput } from "./AdminFormFields";
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
  const [collapsedModuleIds, setCollapsedModuleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [editModule, setEditModule] = useState<ManagedModule | null>(null);
  const [lessonDialog, setLessonDialog] = useState<{
    module: ManagedModule;
    lesson?: ManagedLesson;
  } | null>(null);
  const [quizDialog, setQuizDialog] = useState<{
    module: ManagedModule;
    lesson?: ManagedLesson;
    quiz?: ManagedQuiz;
  } | null>(null);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleStatus, setModuleStatus] = useState<CoursePublishStatus>("published");
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

  function openAddModule() {
    setModuleTitle("");
    setModuleDescription("");
    setModuleStatus("published");
    setAddModuleOpen(true);
  }

  function openEditModule(module: ManagedModule) {
    setEditModule(module);
    setModuleTitle(module.title);
    setModuleDescription(module.description ?? "");
    setModuleStatus(module.status);
  }

  function replaceModule(updated: ManagedModule) {
    setModules((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    if (lessonDialog?.module.id === updated.id) {
      const lesson = lessonDialog.lesson
        ? (updated.lessons ?? []).find((item) => item.id === lessonDialog.lesson!.id) ?? lessonDialog.lesson
        : undefined;
      setLessonDialog({ module: updated, lesson });
    }
    if (quizDialog?.module.id === updated.id) {
      const lesson = quizDialog.lesson
        ? (updated.lessons ?? []).find((item) => item.id === quizDialog.lesson!.id) ??
          quizDialog.lesson
        : undefined;
      const quiz = quizDialog.quiz
        ? (updated.quizzes ?? []).find((item) => item.id === quizDialog.quiz!.id) ?? quizDialog.quiz
        : undefined;
      setQuizDialog({ module: updated, lesson, quiz });
    }
    if (editModule?.id === updated.id) setEditModule(updated);
  }

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
      setCollapsedModuleIds((prev) => prev.filter((id) => id !== created.id));
      setAddModuleOpen(false);
      setModuleTitle("");
      setModuleDescription("");
      setModuleStatus("published");
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

  async function onUpdateModule(event: FormEvent) {
    event.preventDefault();
    if (!token || !editModule || !moduleTitle.trim()) return;
    setSavingModule(true);
    setError("");
    try {
      const updated = await updateModuleApi(token, editModule.id, {
        title: moduleTitle.trim(),
        description: moduleDescription.trim() || null,
        status: moduleStatus,
      });
      replaceModule({
        ...editModule,
        ...updated,
        lessons: editModule.lessons,
        quizzes: editModule.quizzes,
      });
      setEditModule(null);
      setSuccess("Module updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update module.");
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
      setCollapsedModuleIds((prev) => prev.filter((id) => id !== module.id));
      setSuccess("Module deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete module.");
    }
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
      backHref="/admin/courses"
      backLabel="Back to courses"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {course ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
            >
              Edit course
            </Button>
          ) : null}
          <Button type="button" onClick={openAddModule}>
            <Plus data-icon="inline-start" />
            Add module
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {success}
          </div>
        ) : null}

        <p className="text-sm text-foreground/80">
          <span className="tabular-nums font-semibold text-foreground">{modules.length}</span> modules
          <span className="mx-2 text-foreground/35">·</span>
          <span className="tabular-nums font-semibold text-foreground">
            {modules.reduce((sum, item) => sum + (item.lessons ?? []).length, 0)}
          </span>{" "}
          lessons
          <span className="mx-2 text-foreground/35">·</span>
          <span className="tabular-nums font-semibold text-foreground">
            {modules.reduce((sum, item) => sum + (item.quizzes ?? []).length, 0)}
          </span>{" "}
          quizzes
        </p>

        <div className="overflow-hidden rounded-lg border border-border/80 bg-card">
          {modules.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">No modules yet.</p>
              <Button type="button" className="mt-4" onClick={openAddModule}>
                <Plus data-icon="inline-start" />
                Add first module
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {modules.map((module, moduleIndex) => {
                const open = !collapsedModuleIds.includes(module.id);
                const lessonCount = (module.lessons ?? []).length;
                const quizCount = (module.quizzes ?? []).length;

                function toggleModule() {
                  setCollapsedModuleIds((prev) =>
                    open ? [...prev, module.id] : prev.filter((id) => id !== module.id),
                  );
                }

                return (
                  <li key={module.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:px-5">
                      <button
                        type="button"
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-foreground/70 transition hover:bg-muted hover:text-foreground"
                        aria-expanded={open}
                        aria-label={open ? "Collapse module" : "Expand module"}
                        onClick={toggleModule}
                      >
                        {open ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={toggleModule}
                      >
                        <span className="w-16 shrink-0 text-[11px] font-semibold tracking-wide text-foreground/70 uppercase">
                          Module {moduleIndex + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                              {module.title}
                            </p>
                            {module.status !== "published" ? (
                              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                Draft
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-foreground/70">
                            {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                            <span className="mx-1.5 text-foreground/35">·</span>
                            {quizCount} quiz{quizCount === 1 ? "" : "zes"}
                            {module.description?.trim()
                              ? ` · ${module.description.trim()}`
                              : null}
                          </p>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        <ActionMenu
                          items={[
                            {
                              label: "Edit module",
                              onClick: () => openEditModule(module),
                            },
                            {
                              label: "Add lesson",
                              onClick: () => {
                                setCollapsedModuleIds((prev) =>
                                  prev.filter((id) => id !== module.id),
                                );
                                setLessonDialog({ module });
                              },
                            },
                            {
                              label: "Add quiz",
                              onClick: () => {
                                setCollapsedModuleIds((prev) =>
                                  prev.filter((id) => id !== module.id),
                                );
                                setQuizDialog({ module });
                              },
                            },
                            {
                              label: "Delete module",
                              destructive: true,
                              onClick: () => void onDeleteModule(module),
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {open ? (
                      <div className="border-t border-border/60 bg-background px-4 py-2 sm:px-5 sm:pl-14">
                        <ModuleExpandedPanel
                          token={token!}
                          module={module}
                          onChange={replaceModule}
                          onError={setError}
                          onSuccess={setSuccess}
                          onEditLesson={(lesson) => setLessonDialog({ module, lesson })}
                          onAddQuiz={(lesson) => setQuizDialog({ module, lesson })}
                          onEditQuiz={(lesson, quiz) =>
                            setQuizDialog({ module, lesson: lesson ?? undefined, quiz })
                          }
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <ModuleFormDialog
        open={addModuleOpen}
        onOpenChange={setAddModuleOpen}
        title="Add module"
        description="Create a section of this course (e.g. Week 1)."
        moduleTitle={moduleTitle}
        moduleDescription={moduleDescription}
        moduleStatus={moduleStatus}
        saving={savingModule}
        submitLabel={savingModule ? "Saving…" : "Add module"}
        onTitleChange={setModuleTitle}
        onDescriptionChange={setModuleDescription}
        onStatusChange={setModuleStatus}
        onSubmit={onCreateModule}
      />

      <ModuleFormDialog
        open={Boolean(editModule)}
        onOpenChange={(open) => {
          if (!open) setEditModule(null);
        }}
        title="Edit module"
        description="Update this module title, description, or status."
        moduleTitle={moduleTitle}
        moduleDescription={moduleDescription}
        moduleStatus={moduleStatus}
        saving={savingModule}
        submitLabel={savingModule ? "Saving…" : "Save module"}
        onTitleChange={setModuleTitle}
        onDescriptionChange={setModuleDescription}
        onStatusChange={setModuleStatus}
        onSubmit={onUpdateModule}
      />

      {lessonDialog && token ? (
        <LessonFormDialog
          open={Boolean(lessonDialog)}
          onOpenChange={(open) => {
            if (!open) setLessonDialog(null);
          }}
          token={token}
          module={lessonDialog.module}
          lesson={lessonDialog.lesson}
          onChange={replaceModule}
          onError={setError}
          onSuccess={setSuccess}
        />
      ) : null}

      {quizDialog && token ? (
        <QuizFormDialog
          open={Boolean(quizDialog)}
          onOpenChange={(open) => {
            if (!open) setQuizDialog(null);
          }}
          token={token}
          module={quizDialog.module}
          lesson={quizDialog.lesson}
          quiz={quizDialog.quiz}
          onChange={replaceModule}
          onError={setError}
          onSuccess={setSuccess}
        />
      ) : null}
    </AdminPageLayout>
  );
}

function ModuleFormDialog({
  open,
  onOpenChange,
  title,
  description,
  moduleTitle,
  moduleDescription,
  moduleStatus,
  saving,
  submitLabel,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  moduleTitle: string;
  moduleDescription: string;
  moduleStatus: CoursePublishStatus;
  saving: boolean;
  submitLabel: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: CoursePublishStatus) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">
          <AdminFormField id="dialog-module-title" label="Module title" required>
            <AdminFormInput
              id="dialog-module-title"
              value={moduleTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Week 1 — Introduction"
              required
            />
          </AdminFormField>
          <AdminFormField id="dialog-module-description" label="Description">
            <textarea
              id="dialog-module-description"
              className="admin-form-input min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={moduleDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Optional short description"
            />
          </AdminFormField>
          <AdminFormField id="dialog-module-status" label="Status">
            <Select
              value={moduleStatus}
              onValueChange={(value) => onStatusChange(value as CoursePublishStatus)}
              items={statusItems}
            >
              <SelectTrigger id="dialog-module-status" className="admin-form-input w-full">
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
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !moduleTitle.trim()}>
              <Plus className="size-4" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function mediaFileName(url: string) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    return name || "Media file";
  } catch {
    const name = url.split("?")[0]?.split("/").pop() || "";
    return name || "Media file";
  }
}

function isDirectVideoFile(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = parsed.pathname.split("/");
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function LessonMediaPreview({
  contentType,
  mediaUrl,
  title,
  body,
}: {
  contentType: LessonContentType;
  mediaUrl?: string | null;
  title: string;
  body?: string | null;
}) {
  if (contentType === "text" && body?.trim()) {
    return (
      <p className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground whitespace-pre-wrap">
        {body.trim()}
      </p>
    );
  }

  if ((contentType === "video" || contentType === "file") && !mediaUrl) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-center text-xs text-muted-foreground">
        No {contentType === "video" ? "video" : "PDF"} attached.
      </p>
    );
  }

  if (contentType === "video" && mediaUrl) {
    const yt = youtubeEmbedUrl(mediaUrl);
    if (yt) {
      return (
        <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
          <iframe
            title={`Video · ${title}`}
            src={yt}
            className="h-[26rem] w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="flex items-center justify-between gap-2 border-t border-border/40 px-3 py-1.5">
            <p className="truncate text-xs text-muted-foreground">YouTube video</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Open
            </a>
          </div>
        </div>
      );
    }

    // Uploaded files / direct MP4 (or CDN URLs without extension) play inline
    if (isDirectVideoFile(mediaUrl) || !/youtube\.com|youtu\.be|vimeo\.com/i.test(mediaUrl)) {
      return (
        <div className="overflow-hidden rounded-lg border border-border/60 bg-black/80">
          <video
            key={mediaUrl}
            controls
            preload="metadata"
            className="h-[26rem] w-full bg-black object-contain"
            src={mediaUrl}
          >
            Your browser does not support the video tag.
          </video>
          <div className="flex items-center justify-between gap-2 border-t border-border/40 bg-background/90 px-3 py-1.5">
            <p className="truncate text-xs text-muted-foreground">{mediaFileName(mediaUrl)}</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Open
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">Video link</p>
          <p className="truncate text-xs text-muted-foreground">{mediaUrl}</p>
        </div>
        <a
          href={mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          Open video
        </a>
      </div>
    );
  }

  if (contentType === "file" && mediaUrl) {
    return (
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
          <FileText className="size-4 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 truncate text-xs font-medium">{mediaFileName(mediaUrl)}</p>
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Open PDF
          </a>
        </div>
        <iframe title={`PDF · ${title}`} src={mediaUrl} className="h-[40rem] w-full bg-muted/30" />
      </div>
    );
  }

  return null;
}

function ModuleExpandedPanel({
  token,
  module,
  onChange,
  onError,
  onSuccess,
  onEditLesson,
  onAddQuiz,
  onEditQuiz,
}: {
  token: string;
  module: ManagedModule;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onEditLesson: (lesson: ManagedLesson) => void;
  onAddQuiz: (lesson: ManagedLesson) => void;
  onEditQuiz: (lesson: ManagedLesson | null, quiz: ManagedQuiz) => void;
}) {
  const quizzes = module.quizzes ?? [];
  const orphanQuizzes = quizzes.filter((quiz) => !quiz.lessonId);
  // Lessons start collapsed so video/PDF previews stay hidden until opened.
  // Multiple lessons can be open at the same time.
  const [expandedLessonIds, setExpandedLessonIds] = useState<string[]>([]);

  async function removeLesson(lesson: ManagedLesson) {
    if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await deleteLessonApi(token, lesson.id);
      onChange({
        ...module,
        lessons: (module.lessons ?? []).filter((item) => item.id !== lesson.id),
        quizzes: quizzes.filter((quiz) => quiz.lessonId !== lesson.id),
      });
      setExpandedLessonIds((prev) => prev.filter((id) => id !== lesson.id));
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

  async function removeQuiz(quiz: ManagedQuiz) {
    if (!window.confirm(`Delete quiz "${quiz.title}"?`)) return;
    try {
      await deleteQuizApi(token, quiz.id);
      onChange({
        ...module,
        quizzes: quizzes.filter((item) => item.id !== quiz.id),
      });
      onSuccess("Quiz deleted.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete quiz.");
    }
  }

  return (
    <div className="space-y-0">
      {(module.lessons ?? []).length === 0 ? (
        <p className="px-1 py-4 text-center text-sm text-muted-foreground">
          No lessons yet. Use the module ⋮ menu → Add lesson.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {(module.lessons ?? []).map((lesson, lessonIndex) => {
            const lessonQuizzes = quizzes.filter((quiz) => quiz.lessonId === lesson.id);
            const lessonOpen = expandedLessonIds.includes(lesson.id);
            const typeLabel =
              lesson.contentType === "file"
                ? "PDF"
                : lesson.contentType === "video"
                  ? "Video"
                  : "Text";

            function toggleLesson() {
              setExpandedLessonIds((prev) =>
                lessonOpen ? prev.filter((id) => id !== lesson.id) : [...prev, lesson.id],
              );
            }

            return (
              <li key={lesson.id}>
                <div className="flex items-center gap-2 py-2.5 transition-colors hover:bg-muted/30">
                  <button
                    type="button"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-foreground/70 transition hover:bg-muted hover:text-foreground"
                    aria-expanded={lessonOpen}
                    aria-label={lessonOpen ? "Collapse lesson" : "Expand lesson"}
                    onClick={toggleLesson}
                  >
                    {lessonOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={toggleLesson}
                  >
                    <span className="w-14 shrink-0 text-[11px] font-semibold tracking-wide text-foreground/70 uppercase">
                      Lesson {lessonIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{lesson.title}</p>
                      <p className="mt-0.5 truncate text-xs text-foreground/70">
                        {typeLabel}
                        {lesson.durationMinutes ? ` · ${lesson.durationMinutes} min` : null}
                        {lessonQuizzes.length > 0
                          ? ` · ${lessonQuizzes.length} quiz${lessonQuizzes.length === 1 ? "" : "zes"}`
                          : null}
                      </p>
                    </div>
                  </button>

                  <ActionMenu
                    items={[
                      {
                        label: "Edit lesson",
                        onClick: () => onEditLesson(lesson),
                      },
                      {
                        label: "Add Quiz",
                        onClick: () => onAddQuiz(lesson),
                      },
                      {
                        label: lesson.status === "published" ? "Unpublish" : "Publish",
                        onClick: () => void toggleLessonStatus(lesson),
                      },
                      {
                        label: "Delete lesson",
                        destructive: true,
                        onClick: () => void removeLesson(lesson),
                      },
                    ]}
                  />
                </div>

                {lessonOpen ? (
                  <div className="space-y-3 border-t border-border/50 pb-3 pl-10 pt-3">
                    <LessonMediaPreview
                      contentType={lesson.contentType}
                      mediaUrl={lesson.mediaUrl}
                      title={lesson.title}
                      body={lesson.body}
                    />

                    {lessonQuizzes.length === 0 ? (
                      <p className="py-2 text-center text-xs text-muted-foreground">
                        No quiz yet. Use the lesson ⋮ menu → Add Quiz.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border/50 rounded-md border border-border/70">
                        {lessonQuizzes.map((quiz, quizIndex) => {
                          const questionCount =
                            (quiz.questions ?? []).length || quiz.questionsCount || 0;

                          return (
                            <li key={quiz.id} className="px-3 py-2.5">
                              <div className="flex items-start gap-3">
                                <span className="w-12 shrink-0 pt-0.5 text-[11px] font-semibold tracking-wide text-foreground/70 uppercase">
                                  Quiz {quizIndex + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-foreground">{quiz.title}</p>
                                  <p className="mt-0.5 text-xs text-foreground/70">
                                    Pass {quiz.passScore}%
                                    <span className="mx-1.5 text-foreground/35">·</span>
                                    {questionCount} question
                                    {questionCount === 1 ? "" : "s"}
                                  </p>
                                  {(quiz.questions ?? []).length > 0 ? (
                                    <ul className="mt-2 space-y-1.5">
                                      {(quiz.questions ?? []).map((question, questionIndex) => (
                                        <li
                                          key={question.id ?? `${quiz.id}-q-${questionIndex}`}
                                          className="px-0.5 py-1"
                                        >
                                          <p className="text-xs font-medium text-foreground">
                                            <span className="mr-1 text-foreground/65">
                                              Q{questionIndex + 1}.
                                            </span>
                                            {question.questionText}
                                          </p>
                                          <ul className="mt-1 space-y-0.5">
                                            {(question.options ?? []).map((option, optionIndex) => (
                                              <li
                                                key={option.id ?? `${questionIndex}-${optionIndex}`}
                                                className={`flex items-center gap-1.5 text-[11px] ${
                                                  option.isCorrect
                                                    ? "font-medium text-emerald-700"
                                                    : "text-foreground/70"
                                                }`}
                                              >
                                                <span className="w-3 shrink-0 font-semibold">
                                                  {String.fromCharCode(65 + optionIndex)}.
                                                </span>
                                                <span>{option.optionText}</span>
                                                {option.isCorrect ? (
                                                  <span className="text-[9px] uppercase">✓</span>
                                                ) : null}
                                              </li>
                                            ))}
                                          </ul>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
                                <ActionMenu
                                  items={[
                                    {
                                      label: "Edit quiz",
                                      onClick: () => onEditQuiz(lesson, quiz),
                                    },
                                    {
                                      label: "Delete quiz",
                                      destructive: true,
                                      onClick: () => void removeQuiz(quiz),
                                    },
                                  ]}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {orphanQuizzes.length > 0 ? (
        <div className="mt-2 border-t border-border/60 pt-2">
          <p className="px-1 pb-1 text-[11px] font-semibold tracking-wide text-foreground/70 uppercase">
            Module quizzes
          </p>
          <ul className="divide-y divide-border/60">
            {orphanQuizzes.map((quiz, quizIndex) => {
              const questionCount =
                (quiz.questions ?? []).length || quiz.questionsCount || 0;

              return (
                <li key={quiz.id} className="py-2.5">
                  <div className="flex items-start gap-3">
                    <span className="w-12 shrink-0 pt-0.5 text-[11px] font-semibold tracking-wide text-foreground/70 uppercase">
                      Quiz {quizIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{quiz.title}</p>
                      <p className="mt-0.5 text-xs text-foreground/70">
                        End of module
                        <span className="mx-1.5 text-foreground/35">·</span>
                        Pass {quiz.passScore}%
                        <span className="mx-1.5 text-foreground/35">·</span>
                        {questionCount} question{questionCount === 1 ? "" : "s"}
                      </p>
                      {(quiz.questions ?? []).length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {(quiz.questions ?? []).map((question, questionIndex) => (
                            <li key={question.id ?? `${quiz.id}-q-${questionIndex}`}>
                              <p className="text-xs font-medium text-foreground">
                                <span className="mr-1 text-foreground/65">
                                  Q{questionIndex + 1}.
                                </span>
                                {question.questionText}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <ActionMenu
                      items={[
                        {
                          label: "Edit quiz",
                          onClick: () => onEditQuiz(null, quiz),
                        },
                        {
                          label: "Delete quiz",
                          destructive: true,
                          onClick: () => void removeQuiz(quiz),
                        },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function inferVideoSource(url: string | null | undefined): "upload" | "link" {
  if (!url) return "upload";
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) return "link";
  return "upload";
}

function LessonFormDialog({
  open,
  onOpenChange,
  token,
  module,
  lesson,
  onChange,
  onError,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  module: ManagedModule;
  lesson?: ManagedLesson;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const isEdit = Boolean(lesson);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonContentType>("video");
  const [lessonBody, setLessonBody] = useState("");
  const [lessonMedia, setLessonMedia] = useState("");
  const [videoSource, setVideoSource] = useState<"upload" | "link">("upload");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonStatus, setLessonStatus] = useState<CoursePublishStatus>("published");
  const [savingLesson, setSavingLesson] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (lesson) {
      setLessonTitle(lesson.title);
      setLessonType(lesson.contentType);
      setLessonBody(lesson.body ?? "");
      setLessonMedia(lesson.mediaUrl ?? "");
      setVideoSource(inferVideoSource(lesson.mediaUrl));
      setLessonDuration(
        lesson.durationMinutes != null ? String(lesson.durationMinutes) : "",
      );
      setLessonStatus(lesson.status);
      return;
    }
    setLessonTitle("");
    setLessonType("video");
    setLessonBody("");
    setLessonMedia("");
    setVideoSource("upload");
    setLessonDuration("");
    setLessonStatus("published");
  }, [open, lesson]);

  async function saveLesson(event: FormEvent) {
    event.preventDefault();
    if (!lessonTitle.trim()) return;

    if ((lessonType === "video" || lessonType === "file") && !lessonMedia.trim()) {
      onError(
        lessonType === "video"
          ? videoSource === "link"
            ? "Please paste a video link."
            : "Please upload a video."
          : "Please upload a PDF.",
      );
      return;
    }

    if (lessonType === "video" && videoSource === "link") {
      try {
        new URL(lessonMedia.trim());
      } catch {
        onError("Please enter a valid video URL (https://…).");
        return;
      }
    }

    const payload = {
      title: lessonTitle.trim(),
      contentType: lessonType,
      body: lessonBody.trim() || null,
      mediaUrl: lessonType === "text" ? null : lessonMedia.trim() || null,
      durationMinutes: lessonDuration ? Number(lessonDuration) : null,
      status: lessonStatus,
    };

    setSavingLesson(true);
    try {
      if (lesson) {
        const updated = await updateLessonApi(token, lesson.id, payload);
        onChange({
          ...module,
          lessons: (module.lessons ?? []).map((item) =>
            item.id === lesson.id ? { ...item, ...updated } : item,
          ),
        });
        onSuccess("Lesson updated.");
      } else {
        const created = await createLessonApi(token, module.id, payload);
        onChange({
          ...module,
          lessons: [...(module.lessons ?? []), created],
          lessonsCount: (module.lessonsCount ?? 0) + 1,
        });
        onSuccess("Lesson created.");
      }
      onOpenChange(false);
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update lesson."
            : "Failed to create lesson.",
      );
    } finally {
      setSavingLesson(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            {isEdit ? "Edit lesson" : "Add lesson"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update" : "Add a video, PDF, or text lesson to"}{" "}
            <span className="font-medium text-foreground">{module.title}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={saveLesson} className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminFormField id="lesson-title" label="Lesson title" required>
              <AdminFormInput
                id="lesson-title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Introduction to AI"
                required
              />
            </AdminFormField>
            <AdminFormField id="lesson-type" label="Lesson type">
              <Select
                value={lessonType}
                onValueChange={(value) => {
                  const next = value as LessonContentType;
                  setLessonType(next);
                  setLessonMedia("");
                  setVideoSource("upload");
                }}
                items={contentTypeItems}
              >
                <SelectTrigger id="lesson-type" className="admin-form-input w-full">
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
            </AdminFormField>
            {lessonType === "video" ? (
              <AdminFormField
                id="lesson-media"
                label="Video"
                required
                className="sm:col-span-2"
              >
                <div className="space-y-3">
                  <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        videoSource === "upload"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => {
                        setVideoSource("upload");
                        setLessonMedia("");
                      }}
                    >
                      Upload file
                    </button>
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        videoSource === "link"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => {
                        setVideoSource("link");
                        setLessonMedia("");
                      }}
                    >
                      Use link
                    </button>
                  </div>
                  {videoSource === "upload" ? (
                    <LessonMediaUploadField
                      token={token}
                      type="video"
                      mediaUrl={lessonMedia || null}
                      slug={module.slug}
                      onChange={(url) => setLessonMedia(url ?? "")}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <AdminFormInput
                        id="lesson-media"
                        type="url"
                        value={lessonMedia}
                        onChange={(e) => setLessonMedia(e.target.value)}
                        placeholder="https://… (YouTube, Vimeo, or direct MP4)"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste a public video URL. Direct MP4 links play in the preview; other hosts open in a new tab.
                      </p>
                    </div>
                  )}
                </div>
              </AdminFormField>
            ) : null}
            {lessonType === "file" ? (
              <AdminFormField
                id="lesson-media"
                label="PDF file"
                required
                className="sm:col-span-2"
              >
                <LessonMediaUploadField
                  token={token}
                  type="file"
                  mediaUrl={lessonMedia || null}
                  slug={module.slug}
                  onChange={(url) => setLessonMedia(url ?? "")}
                />
              </AdminFormField>
            ) : null}
            <AdminFormField id="lesson-notes" label="Notes" className="sm:col-span-2">
              <textarea
                id="lesson-notes"
                className="admin-form-input min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
                value={lessonBody}
                onChange={(e) => setLessonBody(e.target.value)}
                placeholder="Optional lesson text / notes"
              />
            </AdminFormField>
            {lessonType === "video" ? (
              <AdminFormField id="lesson-duration" label="Duration (minutes)">
                <AdminFormInput
                  id="lesson-duration"
                  type="number"
                  min="0"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="e.g. 12"
                />
              </AdminFormField>
            ) : null}
            <AdminFormField id="lesson-status" label="Status">
              <Select
                value={lessonStatus}
                onValueChange={(value) => setLessonStatus(value as CoursePublishStatus)}
                items={statusItems}
              >
                <SelectTrigger id="lesson-status" className="admin-form-input w-full">
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
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingLesson || !lessonTitle.trim()}>
              {isEdit ? null : <Plus className="size-4" />}
              {savingLesson ? "Saving…" : isEdit ? "Save lesson" : "Add lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuizFormDialog({
  open,
  onOpenChange,
  token,
  module,
  lesson,
  quiz,
  onChange,
  onError,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  module: ManagedModule;
  lesson?: ManagedLesson;
  quiz?: ManagedQuiz;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const isEdit = Boolean(quiz);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPass, setQuizPass] = useState("70");
  const [quizStatus, setQuizStatus] = useState<CoursePublishStatus>("published");
  const [questions, setQuestions] = useState<ManagedQuizQuestion[]>([emptyQuestion()]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (quiz) {
      setQuizTitle(quiz.title);
      setQuizPass(String(quiz.passScore ?? 70));
      setQuizStatus(quiz.status);
      setQuestions(
        (quiz.questions ?? []).length > 0
          ? quiz.questions!.map((question) => ({
              ...question,
              options:
                question.options.length > 0
                  ? question.options
                  : emptyQuestion().options,
            }))
          : [emptyQuestion()],
      );
      return;
    }
    setQuizTitle("");
    setQuizPass("70");
    setQuizStatus("published");
    setQuestions([emptyQuestion()]);
  }, [open, quiz]);

  async function saveQuiz(event: FormEvent) {
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

    const payload = {
      title: quizTitle.trim(),
      lessonId: lesson?.id ?? null,
      passScore: Number(quizPass) || 70,
      status: quizStatus,
      questions: cleaned,
    };

    setSavingQuiz(true);
    try {
      if (quiz) {
        const updated = await updateQuizApi(token, quiz.id, payload);
        onChange({
          ...module,
          quizzes: (module.quizzes ?? []).map((item) =>
            item.id === quiz.id ? { ...item, ...updated } : item,
          ),
        });
        onSuccess("Quiz updated.");
      } else {
        const created = await createQuizApi(token, module.id, payload);
        onChange({
          ...module,
          quizzes: [...(module.quizzes ?? []), created],
          quizzesCount: (module.quizzesCount ?? 0) + 1,
        });
        onSuccess("Quiz created.");
      }
      onOpenChange(false);
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update quiz."
            : "Failed to create quiz.",
      );
    } finally {
      setSavingQuiz(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border/60 p-0 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <DialogHeader className="shrink-0 space-y-2 px-6 pt-5 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEdit ? "Edit quiz" : "Add quiz"}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">for</span>
            <span className="inline-flex max-w-full items-center rounded-full border border-border/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {lesson ? lesson.title : `${module.title} · end of module`}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={saveQuiz} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-2">
            <div className="grid gap-4 sm:grid-cols-[1fr_100px_130px]">
              <AdminFormField id="quiz-title" label="Quiz title" required>
                <AdminFormInput
                  id="quiz-title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. First Quiz"
                  required
                  className="h-11 rounded-xl"
                />
              </AdminFormField>
              <AdminFormField id="quiz-pass" label="Pass %">
                <AdminFormInput
                  id="quiz-pass"
                  type="number"
                  min="0"
                  max="100"
                  value={quizPass}
                  onChange={(e) => setQuizPass(e.target.value)}
                  placeholder="70"
                  className="h-11 rounded-xl"
                />
              </AdminFormField>
              <AdminFormField id="quiz-status" label="Status">
                <Select
                  value={quizStatus}
                  onValueChange={(value) => setQuizStatus(value as CoursePublishStatus)}
                  items={statusItems}
                >
                  <SelectTrigger id="quiz-status" className="admin-form-input h-11 w-full rounded-xl">
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
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-base font-semibold tracking-tight">Questions</p>
                  <p className="text-xs text-muted-foreground">Mark one correct answer per question</p>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {questions.length} total
                </span>
              </div>

              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-3 rounded-2xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                        {questionIndex + 1}
                      </span>
                      <p className="text-sm font-medium">Question {questionIndex + 1}</p>
                    </div>
                    <div className="flex items-center gap-1">
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
                        <SelectTrigger className="admin-form-input h-9 w-[158px] rounded-full border-border/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                          <SelectItem value="true_false">True / False</SelectItem>
                        </SelectContent>
                      </Select>
                      {questions.length > 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setQuestions((prev) => prev.filter((_, index) => index !== questionIndex))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
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
                    placeholder="Type your question…"
                    required
                    className="h-11 rounded-xl"
                  />

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                          option.isCorrect
                            ? "border-emerald-400/60 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                            : "border-border/60 bg-white hover:border-border hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-muted/40"
                        }`}
                      >
                        <span
                          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                            option.isCorrect
                              ? "bg-emerald-500 text-white"
                              : "border border-border bg-white text-muted-foreground dark:bg-background"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <input
                          type="radio"
                          className="sr-only"
                          name={`question-${questionIndex}-correct`}
                          checked={option.isCorrect}
                          onChange={() =>
                            setQuestions((prev) =>
                              prev.map((item, index) =>
                                index === questionIndex
                                  ? {
                                      ...item,
                                      options: item.options.map((opt, optIndex) => ({
                                        ...opt,
                                        isCorrect: optIndex === optionIndex,
                                      })),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                        <input
                          className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          value={option.optionText}
                          onChange={(e) =>
                            setQuestions((prev) =>
                              prev.map((item, index) =>
                                index === questionIndex
                                  ? {
                                      ...item,
                                      options: item.options.map((opt, optIndex) =>
                                        optIndex === optionIndex
                                          ? { ...opt, optionText: e.target.value }
                                          : opt,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          required
                          disabled={question.type === "true_false"}
                        />
                        {option.isCorrect ? (
                          <span className="text-[11px] font-semibold text-emerald-600">Correct</span>
                        ) : null}
                      </label>
                    ))}
                    {question.type === "multiple_choice" ? (
                      <button
                        type="button"
                        className="mt-1 inline-flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
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
                        <Plus className="size-3.5" />
                        Add option
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 py-3 text-sm font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
              >
                <Plus className="size-4" />
                Add another question
              </button>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-2 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full px-5"
              disabled={savingQuiz || !quizTitle.trim()}
            >
              {savingQuiz ? "Saving…" : isEdit ? "Save quiz" : "Add quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
