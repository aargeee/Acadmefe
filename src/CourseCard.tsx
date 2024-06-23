import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Courses } from "./types";

export function CourseCard({ id, name, description }: Courses) {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-end">
        <a href={`/courses/${id}`}><Button>View</Button></a>
      </CardFooter>
    </Card>
  );
}
