import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ACAD_ME_URL } from "./env";
import { useToast } from "./components/ui/use-toast";
import { UUID } from "crypto";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Spinner } from "./components/ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "./components/ui/scroll-area";
import DOMPurify from "dompurify";
import SafeHTML from "./safe-html";

interface Tutor {
  id: UUID;
  username: string;
  first_name: string;
  last_name: string;
}

interface Content {
  id: UUID;
  name: string;
  position: number;
}

interface Chapter {
  id: UUID;
  name: string;
  position: number;
  content: Content[];
}

interface CourseData {
  id: UUID;
  name: string;
  description: string;
  category: UUID;
  chapters: Chapter[];
  tutors: Tutor[];
  enrolled_count: number;
}

interface ContentViewProps {
  contentId: UUID;
}

interface ContentDetail {
  id: UUID;
  name: string;
  content: string;
  position: number;
  chapter: UUID;
  type: string;
}

const ContentView = ({ contentId }: ContentViewProps) => {
  const { toast } = useToast();
  const [contentData, setContentData] = useState<ContentDetail | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `${ACAD_ME_URL}/courses/content/${contentId}`
        );
        if (!response.ok) throw new Error("Failed to fetch content.");
        const data = await response.json();
        data.data.content = DOMPurify.sanitize(data.data.content);
        setContentData(data.data);
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    })();
  }, [contentId, toast]);

  if (contentData?.type === "HTML")
    return (
      <ScrollArea className="h-[85vh] w-full rounded-md border p-3">
        <SafeHTML html={contentData?.content || ""} />
      </ScrollArea>
    );
  return (
    <iframe
      className="video w-full h-full"
      title="Youtube player"
      sandbox="allow-same-origin allow-scripts allow-presentation"
      src={`${contentData?.content}?rel=0&autoplay=1`}
      allowFullScreen
    ></iframe>
  );
};

const CourseContent = ({ id, name }: Content) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {name}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-screen max-w-screen-2xl">
        <DialogHeader className="flex flex-col">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="h-full w-full">
          <ContentView contentId={id} />
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CoursePage = () => {
  const { id } = useParams<{ id: UUID }>();
  const { toast } = useToast();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${ACAD_ME_URL}/courses/${id}/content`);
        if (!response.ok) throw new Error("Failed to fetch course detail");
        const data = await response.json();
        setCourseData(data.data);
        setLoading(false);
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    })();
  }, [id, toast]);

  if (isLoading)
    return (
      <div className="mx-auto">
        <Spinner />
      </div>
    );

  return (
    <div className="lg:px-60 py-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="capitalize">{courseData?.name}</CardTitle>
          <CardDescription>{courseData?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {courseData?.chapters.map((chapter) => (
              <AccordionItem value={chapter.id} key={chapter.id}>
                <AccordionTrigger>{chapter.name}</AccordionTrigger>
                <AccordionContent className="flex flex-col items-start gap-1">
                  {chapter.content.map((content) => (
                    <CourseContent key={content.id} {...content} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CoursePage;
