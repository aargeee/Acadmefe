import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCard } from "./CourseCard";
import { Courses, Tutor, Category, SearchFilter } from "./types";
import { ACAD_ME_URL } from "@/env";

interface CourseSearchProps {
  categories: Category[];
  tutors: Tutor[];
}

export function CourseSearch({ tutors, categories }: CourseSearchProps) {
  const [filters, setFilters] = useState<SearchFilter>({
    tutor: [],
    category: "",
    start_date: undefined,
    end_date: undefined,
    course: "",
  });

  const [filterCourses, setFilterCourses] = useState<Courses[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const { toast } = useToast();
  const [datepickerDisable, setDatepickerDisable] = useState<boolean>(true);

  useEffect(() => {
    const filterQuery = debounce(async () => {
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
      } finally {
        setCoursesLoading(false);
      }
    }, 300);

    filterQuery();
  }, [filters, toast]);

  const handleCourseChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, course: evt.target.value });
  };

  const handleTutorChange = (val: string) => {
    setFilters({ ...filters, tutor: [val] });
  };

  const handleCategoryChange = (val: string) => {
    setFilters({ ...filters, category: val });
  };

  const handleDatePickerChange = (start: Date | undefined, end: Date | undefined) => {
    setFilters({ ...filters, start_date: start, end_date: end });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-5">
        <Input
          className="w-1/3"
          placeholder="Type course name"
          onChange={handleCourseChange}
        />
        <div className="py-3 flex gap-5">
          <Select name="tutor" onValueChange={handleTutorChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select tutor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tutors</SelectLabel>
                {tutors.map((tutor, index) => (
                  <SelectItem key={index} value={tutor.id}>
                    {`${tutor.first_name} ${tutor.last_name}`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select name="category" onValueChange={handleCategoryChange}>
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
                    <span>Pick a start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.start_date}
                  onSelect={(val) => {
                    handleDatePickerChange(val, filters.end_date);
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
                    <span>Pick an end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.end_date}
                  onSelect={(val) => {
                    handleDatePickerChange(filters.start_date, val);
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
          {coursesLoading ? (
            <Spinner />
          ) : (
            filterCourses.map((crs, idx) => <CourseCard {...crs} key={idx} />)
          )}
        </CardContent>
      </Card>
    </>
  );
}
