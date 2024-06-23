import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ACAD_ME_URL } from "./env";
import { useToast } from "./components/ui/use-toast";
import { Spinner } from "./components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { UUID } from "crypto";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EnrolledCourses {
  id: UUID;
  name: string;
  description: string;
  category_name: string;
}

interface Profile {
  id: UUID;
  username: string;
  first_name: string;
  last_name: string;
  enrolled_courses: { course: EnrolledCourses }[];
  content_completion_by_date: { [key: string]: number };
}

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ACAD_ME_URL}/iam/profile/${username}`);
        if (!response.ok) throw new Error("Failed to fetch course detail");
        const data = await response.json();
        setProfileData(data.data);
        setLoading(false);
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, username]);

  const contentCompletionData = profileData?.content_completion_by_date;

  const chartData = {
    labels: contentCompletionData ? Object.keys(contentCompletionData) : [],
    datasets: [
      {
        label: 'Content Completion',
        data: contentCompletionData ? Object.values(contentCompletionData) : [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // Set position to 'top'
      },
      title: {
        display: true,
        text: 'Content Completion Over Time',
      },
    },
  };

  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <div className="w-full lg:px-48 py-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Learner {username}</CardTitle>
          <CardDescription>@{profileData?.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[40%_60%]">
            <div className="flex flex-col gap-3 justify-start p-5">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={profileData?.username} disabled />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" value={profileData?.first_name} disabled />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" value={profileData?.last_name} disabled />
              </div>
              {contentCompletionData && (
                <Line data={chartData} options={options} />
              )}
            </div>
            <div className="p-5 h-full">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Enrolled Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-3 flex-wrap justify-center">
                        {profileData?.enrolled_courses?.map((course, idx) => {
                            return <Card key={idx} className="w-1/4">
                                <CardHeader>
                                    <CardTitle>{course.course.name}</CardTitle>
                                </CardHeader>
                                <CardFooter className="flex justify-between">
                                    <Badge>{course.course.category_name}</Badge>
                                    <a href={`/courses/${course.course.id}`}><Button>View</Button></a>
                                </CardFooter>
                            </Card>
                        })}
                    </CardContent>
                </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
