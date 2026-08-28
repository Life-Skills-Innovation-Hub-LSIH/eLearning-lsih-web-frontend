"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageLayout } from "@/features/admin/components/AdminPageLayout";
import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/admin/shadcn";
import { countLessons, countQuizzes, mockCourses } from "@/features/courses";

export default function AdminCoursesPage() {
  return (
    <AdminPageLayout
      title="Courses"
      description="Manage course catalog, modules, and lessons."
      actions={
        <Button disabled>
          <Plus />
          Add course
        </Button>
      }
    >
      <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
        <div className="border-b bg-muted/20 px-5 py-3.5">
          <p className="text-sm font-semibold">
            Catalog{" "}
            <span className="font-normal text-muted-foreground">{mockCourses.length} courses</span>
          </p>
        </div>

        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-4">Course</TableHead>
              <TableHead className="px-4">Structure</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Price</TableHead>
              <TableHead className="px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="px-4 py-4">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.category}</p>
                </TableCell>
                <TableCell className="px-4 py-4 text-muted-foreground">
                  {course.modules.length} modules · {countLessons(course)} lessons ·{" "}
                  {countQuizzes(course)} quizzes
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Badge
                    variant="outline"
                    className={
                      course.status === "published"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    nativeButton={false}
                    render={<Link href={`/admin/courses/${course.id}`} />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminPageLayout>
  );
}
