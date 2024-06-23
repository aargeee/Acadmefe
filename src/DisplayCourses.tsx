import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { CourseSearch } from "./CourseSearch";
import { Category, Tutor } from "./types";
import { ACAD_ME_URL } from "@/env";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { CourseCard } from "./CourseCard";

export function DisplayCourses() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [tutors, setTutors] = useState<Tutor[]>([]);

  const getCourseSet = async (categoryname: string) => {
    const category = categories.find(cat => cat.name === categoryname);

    if (category && category.courses.length > 0) {
      // Courses for this category are already fetched, no need to fetch again
      return;
    }

    setCategories(prevCategories =>
      prevCategories.map(cat =>
        cat.name === categoryname ? { ...cat, isLoading: true } : cat
      )
    );

    try {
      const response = await fetch(
        `${ACAD_ME_URL}/courses/search/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: categoryname }),
        }
      );

      if (!response.ok) {
        throw new Error(`Could not fetch courses in category: ${categoryname}`);
      }

      const data = await response.json();
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.name === categoryname
            ? {
                ...cat,
                courses: data.data.courses,
                isLoading: false,
              }
            : cat
        )
      );
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.name === categoryname ? { ...cat, isLoading: false } : cat
        )
      );
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${ACAD_ME_URL}/courses/category`);
        if (!response.ok) {
          toast({
            title: "Could not fetch categories",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const data = await response.json();
        const fetchedCategories = data.data.map((category: Category) => ({
          ...category,
          courses: [],
          isLoading: false,
        }));
        setCategories(fetchedCategories);

        // Fetch initial courses for the first category
        if (fetchedCategories.length > 0) {
          await getCourseSet(fetchedCategories[0].name);
        }
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchTutors = async () => {
      try {
        const response = await fetch(`${ACAD_ME_URL}/iam/tutors`);
        if (!response.ok) throw new Error("Failed to fetch tutors");
        const data = await response.json();
        setTutors(data.data);
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    };

    fetchCategories();
    fetchTutors();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Tabs defaultValue={categories[0]?.name || "search"} className="w-full">
      <TabsList className="w-fit flex justify-around gap-4 mx-auto md:mx-0">
        <TabsTrigger value="search">Search</TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger
            value={category.name}
            className="capitalize"
            key={category.id}
            onClick={() => getCourseSet(category.name)}
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="search">
        <CourseSearch categories={categories} tutors={tutors} />
      </TabsContent>
      {categories.map((category) => (
        <TabsContent value={category.name} key={category.id}>
          <Card>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.isLoading ? (
                <div className="flex justify-center items-center">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-y-8 justify-items-center">
                  {category.courses.map((course) => (
                    <CourseCard {...course} key={course.id} />
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
