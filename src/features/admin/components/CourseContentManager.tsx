"use client";

import { FormEvent, Fragment, useEffect, useState } from "react";
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
  Card,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

function statusBadgeClass(status: CoursePublishStatus) {
  return status === "published"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
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

  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [editModule, setEditModule] = useState<ManagedModule | null>(null);
  const [lessonModule, setLessonModule] = useState<ManagedModule | null>(null);
  const [quizTarget, setQuizTarget] = useState<{
    module: ManagedModule;
    lesson: ManagedLesson;
  } | null>(null);

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
    setModuleStatus("draft");
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
    if (lessonModule?.id === updated.id) setLessonModule(updated);
    if (quizTarget?.module.id === updated.id) {
      const lesson =
        (updated.lessons ?? []).find((item) => item.id === quizTarget.lesson.id) ?? quizTarget.lesson;
      setQuizTarget({ module: updated, lesson });
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
      setExpandedId(created.id);
      setAddModuleOpen(false);
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
      if (expandedId === module.id) setExpandedId(null);
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
      description="Expand a module to see its lessons. Add a quiz under each lesson."
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
            <Plus />
            Add module
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="admin-stat-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Modules
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{modules.length}</p>
          </div>
          <div className="admin-stat-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Lessons
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {modules.reduce((sum, item) => sum + (item.lessons ?? []).length, 0)}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Quizzes
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {modules.reduce((sum, item) => sum + (item.quizzes ?? []).length, 0)}
            </p>
          </div>
        </div>

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

        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="flex flex-col gap-1 border-b px-4 py-4">
            <h2 className="text-base font-semibold">Modules</h2>
            <p className="text-sm text-muted-foreground">
              {modules.length
                ? `${modules.length} module${modules.length === 1 ? "" : "s"} in this course.`
                : "No modules yet. Add the first module."}
            </p>
          </div>

          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 px-4" />
                <TableHead className="w-[40%] px-4">Module</TableHead>
                <TableHead className="w-[15%] px-4">Status</TableHead>
                <TableHead className="w-[20%] px-4">Content</TableHead>
                <TableHead className="w-[25%] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                    No modules yet.{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={openAddModule}
                    >
                      Add the first module
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((module, moduleIndex) => {
                  const open = expandedId === module.id;
                  const lessonCount = (module.lessons ?? []).length;
                  const quizCount = (module.quizzes ?? []).length;

                  return (
                    <Fragment key={module.id}>
                      <TableRow>
                        <TableCell className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
                            aria-expanded={open}
                            aria-label={open ? "Collapse module" : "Expand module"}
                            onClick={() => setExpandedId(open ? null : module.id)}
                          >
                            {open ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="max-w-0 px-4 py-4">
                          <button
                            type="button"
                            className="flex w-full min-w-0 items-start gap-3 text-left"
                            onClick={() => setExpandedId(open ? null : module.id)}
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <span className="text-sm font-bold">{moduleIndex + 1}</span>
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="truncate font-medium">{module.title}</p>
                              <p
                                className="truncate text-sm text-muted-foreground"
                                title={module.description?.trim() || undefined}
                              >
                                {module.description?.trim() || module.slug || "No description"}
                              </p>
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge variant="outline" className={statusBadgeClass(module.status)}>
                            {module.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                          {lessonCount} lesson{lessonCount === 1 ? "" : "s"} · {quizCount} quiz
                          {quizCount === 1 ? "" : "zes"}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedId(open ? null : module.id)}
                            >
                              Lessons
                            </Button>
                            <ActionMenu
                              items={[
                                {
                                  label: "Edit module",
                                  onClick: () => openEditModule(module),
                                },
                                {
                                  label: "Add lesson",
                                  onClick: () => {
                                    setExpandedId(module.id);
                                    setLessonModule(module);
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
                        </TableCell>
                      </TableRow>

                      {open ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5} className="border-t border-border/60 bg-muted/30 p-3 sm:p-4">
                            <ModuleExpandedPanel
                              token={token!}
                              module={module}
                              onChange={replaceModule}
                              onError={setError}
                              onSuccess={setSuccess}
                              onAddLesson={() => setLessonModule(module)}
                              onAddQuiz={(lesson) => setQuizTarget({ module, lesson })}
                            />
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
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

      {lessonModule && token ? (
        <AddLessonDialog
          open={Boolean(lessonModule)}
          onOpenChange={(open) => {
            if (!open) setLessonModule(null);
          }}
          token={token}
          module={lessonModule}
          onChange={replaceModule}
          onError={setError}
          onSuccess={setSuccess}
        />
      ) : null}

      {quizTarget && token ? (
        <AddQuizDialog
          open={Boolean(quizTarget)}
          onOpenChange={(open) => {
            if (!open) setQuizTarget(null);
          }}
          token={token}
          module={quizTarget.module}
          lesson={quizTarget.lesson}
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

function ModuleExpandedPanel({
  token,
  module,
  onChange,
  onError,
  onSuccess,
  onAddLesson,
  onAddQuiz,
}: {
  token: string;
  module: ManagedModule;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onAddLesson: () => void;
  onAddQuiz: (lesson: ManagedLesson) => void;
}) {
  const quizzes = module.quizzes ?? [];
  const orphanQuizzes = quizzes.filter((quiz) => !quiz.lessonId);

  async function removeLesson(lesson: ManagedLesson) {
    if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await deleteLessonApi(token, lesson.id);
      onChange({
        ...module,
        lessons: (module.lessons ?? []).filter((item) => item.id !== lesson.id),
        quizzes: quizzes.filter((quiz) => quiz.lessonId !== lesson.id),
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
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Lessons</h3>
          <Badge variant="secondary" className="font-normal">
            {(module.lessons ?? []).length}
          </Badge>
        </div>
        <Button type="button" size="sm" onClick={onAddLesson}>
          <Plus className="size-4" />
          Add lesson
        </Button>
      </div>

      {(module.lessons ?? []).length === 0 ? (
        <p className="px-3 py-5 text-center text-sm text-muted-foreground">
          No lessons yet. Click <span className="font-medium text-foreground">Add lesson</span> to start.
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {(module.lessons ?? []).map((lesson, lessonIndex) => {
            const lessonQuizzes = quizzes.filter((quiz) => quiz.lessonId === lesson.id);

            return (
              <li key={lesson.id} className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                    {lessonIndex + 1}
                  </span>
                  {lesson.contentType === "video" ? (
                    <Video className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{lesson.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
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
                      {` · ${lessonQuizzes.length} quiz${lessonQuizzes.length === 1 ? "" : "zes"}`}
                      {" · "}
                      <span
                        className={
                          lesson.status === "published" ? "text-emerald-600" : "text-amber-600"
                        }
                      >
                        {lesson.status === "published" ? "Published" : "Draft"}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button type="button" size="sm" onClick={() => onAddQuiz(lesson)}>
                      <Plus className="size-4" />
                      Add Quiz
                    </Button>
                    <ActionMenu
                      items={[
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
                </div>

                {lessonQuizzes.length > 0 ? (
                  <div className="mt-2.5 ml-3 space-y-2 border-l-2 border-primary/20 pl-3">
                    {lessonQuizzes.map((quiz, quizIndex) => (
                      <div
                        key={quiz.id}
                        className="rounded-lg border border-border/80 bg-muted/20 p-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium">
                              <HelpCircle className="size-3.5 shrink-0 text-primary" />
                              <span className="text-xs text-muted-foreground">Quiz {quizIndex + 1}</span>
                              <span className="truncate">{quiz.title}</span>
                            </p>
                            <p className="mt-0.5 pl-5 text-xs text-muted-foreground">
                              Pass {quiz.passScore}% ·{" "}
                              {(quiz.questions ?? []).length || quiz.questionsCount || 0} questions ·{" "}
                              {quiz.status === "published" ? "Published" : "Draft"}
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
                        </div>

                        {(quiz.questions ?? []).length > 0 ? (
                          <ul className="mt-2 space-y-1.5 pl-1">
                            {(quiz.questions ?? []).map((question, questionIndex) => (
                              <li
                                key={question.id ?? `${quiz.id}-q-${questionIndex}`}
                                className="rounded-md border border-border/60 bg-background px-2.5 py-1.5"
                              >
                                <p className="text-xs font-medium">
                                  Q{questionIndex + 1}. {question.questionText}
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                  {(question.options ?? []).map((option, optionIndex) => (
                                    <li
                                      key={option.id ?? `${questionIndex}-${optionIndex}`}
                                      className={`flex items-center gap-2 text-xs ${
                                        option.isCorrect
                                          ? "font-medium text-emerald-700 dark:text-emerald-300"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      <span
                                        className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                                          option.isCorrect
                                            ? "bg-emerald-600 text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {option.isCorrect ? "✓" : String.fromCharCode(65 + optionIndex)}
                                      </span>
                                      <span>{option.optionText}</span>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {orphanQuizzes.length > 0 ? (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
            Quizzes not linked to a lesson
          </p>
          <ul className="space-y-2">
            {orphanQuizzes.map((quiz) => (
              <li
                key={quiz.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm"
              >
                <span className="truncate">{quiz.title}</span>
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
        </div>
      ) : null}
    </div>
  );
}

function AddLessonDialog({
  open,
  onOpenChange,
  token,
  module,
  onChange,
  onError,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  module: ManagedModule;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonContentType>("video");
  const [lessonBody, setLessonBody] = useState("");
  const [lessonMedia, setLessonMedia] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonStatus, setLessonStatus] = useState<CoursePublishStatus>("draft");
  const [savingLesson, setSavingLesson] = useState(false);

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
      onOpenChange(false);
      onSuccess("Lesson created.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create lesson.");
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
            Add lesson
          </DialogTitle>
          <DialogDescription>
            Add a video, PDF, or text lesson to <span className="font-medium text-foreground">{module.title}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={addLesson} className="space-y-4 overflow-y-auto px-5 py-4">
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
            {(lessonType === "video" || lessonType === "file") && (
              <AdminFormField
                id="lesson-media"
                label={lessonType === "video" ? "Video file" : "PDF file"}
                required
                className="sm:col-span-2"
              >
                <LessonMediaUploadField
                  token={token}
                  type={lessonType}
                  mediaUrl={lessonMedia || null}
                  slug={module.slug}
                  onChange={(url) => setLessonMedia(url ?? "")}
                />
              </AdminFormField>
            )}
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
              <Plus className="size-4" />
              {savingLesson ? "Saving…" : "Add lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddQuizDialog({
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
  lesson: ManagedLesson;
  onChange: (module: ManagedModule) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPass, setQuizPass] = useState("70");
  const [quizStatus, setQuizStatus] = useState<CoursePublishStatus>("draft");
  const [questions, setQuestions] = useState<ManagedQuizQuestion[]>([emptyQuestion()]);
  const [savingQuiz, setSavingQuiz] = useState(false);

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
        lessonId: lesson.id,
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
      onOpenChange(false);
      onSuccess("Quiz created.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create quiz.");
    } finally {
      setSavingQuiz(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border/60 p-0 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <DialogHeader className="shrink-0 space-y-2 px-6 pt-5 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">Add quiz</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">for</span>
            <span className="inline-flex max-w-full items-center rounded-full border border-border/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {lesson.title}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={addQuiz} className="flex min-h-0 flex-1 flex-col">
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
                        <Checkbox
                          checked={option.isCorrect}
                          className="sr-only"
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
                        {question.type === "true_false" ? (
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {option.optionText}
                          </span>
                        ) : (
                          <input
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
                            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          />
                        )}
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition ${
                            option.isCorrect
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "invisible"
                          }`}
                        >
                          Correct
                        </span>
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
              {savingQuiz ? "Saving…" : "Add quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
