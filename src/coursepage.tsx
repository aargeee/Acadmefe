import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ACAD_ME_URL } from "./env";
import { useToast } from "./components/ui/use-toast";
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
import { Badge } from "./components/ui/badge";
import { useUser } from "./userContext";
import { UUID } from "crypto";

interface Tutor {
  tutor: TutorDetail;
}

interface TutorDetail {
  id: UUID;
  username: string;
  first_name: string;
  last_name: string;
}

interface Content {
  id: UUID;
  name: string;
  position: number;
  completed: boolean;
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
  enrolled: boolean;
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
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${ACAD_ME_URL}/courses/content/${contentId}`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
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
  }, [contentId, toast, user]);

  if (contentData?.type === "HTML")
    return (
      <ScrollArea className="h-[85vh] w-full rounded-md border p-3">
        <SafeHTML html={contentData?.content || ""} />
      </ScrollArea>
    );

  return (
    <iframe
      className="video w-full h-full"
      title="Video player"
      sandbox="allow-same-origin allow-scripts allow-presentation"
      src={`${contentData?.content}?rel=0&autoplay=1`}
      allowFullScreen
    ></iframe>
  );
};

const CourseContent = ({ id, name, completed }: Content) => {

  const {user} = useUser()
  const {toast} = useToast()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={completed ? "default" : "outline"} className="w-full">
          {name}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-screen max-w-screen-2xl">
        <DialogHeader className="flex flex-col">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="h-full w-full">
          {
            user ? 
            <ContentView contentId={id} />:
            <div>
              <a href="/login"><Button>Login to view content</Button></a>
            </div>
          }
        </div>
        <DialogFooter className="ml-auto">
          <Button onClick={async () => {
            try {
              const response = await fetch(`${ACAD_ME_URL}/courses/content/${id}/markcomplete`, {
                headers: {
                  Authorization: `Bearer ${user?.accessToken}`
                }
              })
              if (!response.ok) throw new Error("Could not mark content complete");
            } catch (error) {
              toast({
                title: error instanceof Error ? error.message : String(error),
                variant: "destructive",
              });
            }
          }}>Mark Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [completedContentIds, setCompletedContentIds] = useState<UUID[]>([]);
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${ACAD_ME_URL}/courses/${id}/content`);
        if (!response.ok) throw new Error("Failed to fetch course detail");
        const data = await response.json();
        setCourseData(data.data);
        setLoading(false);

        if (user) {
          const response = await fetch(`${ACAD_ME_URL}/courses/${id}/content/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch course detail for user");
          const data = await response.json();
          setCourseData((prev) => (prev ? { ...prev, enrolled: data.data.enrolled } : null));
          setCompletedContentIds(data.data.content_id);
        }
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    })();
  }, [id, toast, user]);

  const handleEnroll = async () => {
    if (!user || !courseData) return;
    try {
      const response = await fetch(`${ACAD_ME_URL}/courses/${courseData.id}/enroll/`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Could not enroll learner into course");
      const updatedData = await response.json();
      setCourseData((prev) => (prev ? { ...prev, enrolled: updatedData.data.enrolled } : null));
      toast({
        title: `Enrolled into ${courseData.name}`,
      });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

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
          <div className="flex justify-between">
            <div className="flex gap-5">
              <span>Tutors:</span>
              {courseData?.tutors.map((tutor, tutidx) => (
                <Badge key={tutidx}>{tutor.tutor.username}</Badge>
              ))}
            </div>
            <div>
              <span>Enrolled: {courseData?.enrolled_count}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {courseData?.chapters.map((chapter) => (
              <AccordionItem value={chapter.id} key={chapter.id}>
                <AccordionTrigger>{chapter.name}</AccordionTrigger>
                <AccordionContent className="flex flex-col items-start gap-1">
                  {chapter.content.map((content) => (
                    <CourseContent
                      key={content.id}
                      {...content}
                      completed={completedContentIds.includes(content.id)}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </Button>
          {user ? (
            <Button
              disabled={user.role !== "LEARNER" || courseData?.enrolled}
              onClick={handleEnroll}
            >
              {courseData?.enrolled ? "Enrolled" : "Enroll"}
            </Button>
          ) : (
            <a href="/login">
              <Button>Login</Button>
            </a>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CoursePage;
