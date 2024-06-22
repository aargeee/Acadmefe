import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACAD_ME_URL } from "@/env";
import { useToast } from "./components/ui/use-toast";
import { Spinner } from "./components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "./components/ui/calendar";
import { format } from "date-fns";
import { cn } from "./lib/utils";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";

interface Courses {
  id: string;
  name: string;
  description: string;
  categoryname: string;
}

interface Category {
  id: string;
  name: string;
  courses: Courses[];
  totalpages: number;
  loadedpages: number;
  isLoading?: boolean;
}

function CourseCard({ id, name, description }: Courses) {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
      </CardContent>
      <CardFooter className="flex justify-end">
        <a href={`/course/${id}`}><Button>View</Button></a>
      </CardFooter>
    </Card>
  );
}

interface Tutor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

function DisplayCourses() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [tutors, setTutors] = useState<Tutor[]>([]);

  const getCourseSet = useCallback(
    async (categoryId: string, page: number) => {
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, isLoading: true } : cat
        )
      );

      const categoryIndex = categories.findIndex(
        (cat) => cat.id === categoryId
      );
      if (categoryIndex === -1) return;
      if (
        page > categories[categoryIndex].totalpages ||
        categories[categoryIndex].loadedpages >= page
      ) {
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === categoryId ? { ...cat, isLoading: false } : cat
          )
        );
        return;
      }

      try {
        const response = await fetch(
          `${ACAD_ME_URL}/courses/search/?page=${page}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ category: categories[categoryIndex].name }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Could not fetch courses in category: ${categories[categoryIndex].name}, page: ${page}`
          );
        }

        const data = await response.json();
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  courses:
                    page > cat.loadedpages
                      ? [...cat.courses, ...data.data.courses]
                      : cat.courses,
                  totalpages: data.data.pagination?.total_pages,
                  loadedpages: page,
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
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === categoryId ? { ...cat, isLoading: false } : cat
          )
        );
      }
    },
    [categories, toast]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length > 0) {
        setLoading(false);
        return;
      }

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
        const categoriesWithPages = data.data.map((category: Category) => ({
          ...category,
          courses: [],
          totalpages: 1,
          loadedpages: 0,
          isLoading: false,
        }));
        setCategories(categoriesWithPages);
        setCategories((prev) => {
          getCourseSet(categoriesWithPages[0].id, 1).then(() => console.log());
          return prev;
        });
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchTutors = () => {
      (async () => {
        if (tutors.length > 0) return;
        try {
          const response = await fetch(`${ACAD_ME_URL}/iam/tutors`);
          if (!response.ok) throw new Error("failed to fetch tutors");
          const data = await response.json();
          console.log(data);
          setTutors(data.data);
        } catch (error) {
          toast({
            title: error instanceof Error ? error.message : String(error),
            variant: "destructive",
          });
        }
      })();
    };

    fetchCategories();
    fetchTutors();
  }, [categories.length, getCourseSet, toast, tutors.length]); // Only run once when the component mounts

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  interface SearchFilter {
    tutor: string[];
    category: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    course: string;
  }

  const CourseSearch = () => {
    const [filters, setFilters] = useState<SearchFilter>({
      tutor: [],
      category: "",
      start_date: undefined,
      end_date: undefined,
      course: "",
    });

    const [filterCourses, setFilterCourses] = useState<Courses[]>([]);

    const [CoursesLoading, setCoursesLoading] = useState(false);

    useEffect(() => {
      const filterquery = async () => {
        setCoursesLoading(true);
        try {
          const response = await fetch(`${ACAD_ME_URL}/courses/search/`, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(filters),
          });

          if (!response.ok) throw new Error("Failed to filter courses");

          const data = await response.json();
          setFilterCourses(data.data.courses);
        } catch (error) {
          toast({
            title: error instanceof Error ? error.message : String(error),
            variant: "destructive",
          });
        }
        setCoursesLoading(false);
      };
      filterquery();
    }, [filters]);

    const [datepickerDisable, setDatepickerDisable] = useState<boolean>(true);

    return (
      <>
        <div className="flex justify-between items-center gap-5">
          <Input
            className="w-1/3"
            placeholder="type course name"
            onChange={(evt) => {
              setFilters({ ...filters, course: evt.target.value });
            }}
          />
          <div className="py-3 flex gap-5">
            <Select
              name="tutor"
              onValueChange={(val) => {
                setFilters({ ...filters, tutor: [val] });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select tutor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tutors</SelectLabel>
                  {tutors.map((tutor, index) => (
                    <SelectItem
                      key={index}
                      value={tutor.id}
                    >{`${tutor.first_name} ${tutor.last_name}`}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              name="category"
              onValueChange={(val) => {
                setFilters({ ...filters, category: val });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex gap-5 justify-center items-center ml-10">
              <Checkbox
                onCheckedChange={() => {
                  setDatepickerDisable((prev) => !prev);
                  setFilters((prev) => {
                    return {
                      ...prev,
                      start_date: undefined,
                      end_date: undefined,
                    };
                  });
                }}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={datepickerDisable}
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !filters.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start_date ? (
                      format(filters.start_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.start_date}
                    onSelect={(val) => {
                      setFilters({ ...filters, start_date: val });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p>-</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={datepickerDisable}
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !filters.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.end_date ? (
                      format(filters.end_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.end_date}
                    onSelect={(val) => {
                      setFilters({ ...filters, end_date: val });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-y-8 justify-items-center py-5">
            {CoursesLoading ? (
              <Spinner />
            ) : (
              filterCourses.map((crs, idx) => <CourseCard {...crs} key={idx} />)
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <Tabs defaultValue={"search"} className="w-full">
      <TabsList className="w-fit flex justify-around gap-4 mx-auto md:mx-0">
        <TabsTrigger value="search">Search</TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger
            value={category.name}
            className="capitalize"
            key={category.id}
            onClick={() => getCourseSet(category.id, 1)}
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="search">
        <CourseSearch />
      </TabsContent>
      {categories.map((category) => (
        <TabsContent value={category.name} className="" key={category.id}>
          <Card className="">
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you're done.
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

function App() {
  return (
    <main className="px-4 lg:px-32 py-10">
      <div className="w-full">
        <DisplayCourses />
      </div>
    </main>
  );
}

export default App;
