import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useUser } from "./userContext";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "./components/ui/use-toast";
import { ToastAction } from "./components/ui/toast";
import { Navigate, useNavigate } from "react-router-dom";
import { ACAD_ME_URL } from "./env";

interface SignupFieldsProps {
  info: {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    password_: string;
  };
  setInfo: React.Dispatch<
    React.SetStateAction<{
      username: string;
      firstname: string;
      lastname: string;
      password: string;
      password_: string;
    }>
  >;
}

const SignupFields = ({ info, setInfo }: SignupFieldsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInfo((prevInfo) => ({
      ...prevInfo,
      [id]: value,
    }));
  };
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="aargeee"
          value={info.username}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="firstname">First Name</Label>
        <Input
          id="firstname"
          placeholder="Sonam"
          value={info.firstname}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="lastname">Last Name</Label>
        <Input
          id="lastname"
          placeholder="Bajwa"
          value={info.lastname}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={info.password}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password_">
          Confirm Password{" "}
          {info.password !== info.password_ && (
            <span className="text-red-500">*Passwords do not match</span>
          )}
        </Label>
        <Input
          id="password_"
          type="password"
          value={info.password_}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

const isDisabled = (info: { [key: string]: string }) => {
  return Object.values(info).reduce((acc, value) => acc || value === "", false);
};

const SignupTabs = () => {
  const [learnerInfo, setLearnerInfo] = useState({
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    password_: "",
  });
  const [tutorInfo, setTutorInfo] = useState({
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    password_: "",
  });

  const [isSigningIn, setSigningIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate()

  const handleSignup = async (info: {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    password_: string;
  }, role: string) => {
    setSigningIn(true);
    const response = await fetch(`${ACAD_ME_URL}/iam/signup/${role}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: info.username,
        first_name: info.firstname,
        last_name: info.lastname,
        password: info.password,
      }),
    });
    
    setSigningIn(false);
    console.log(response)
    if (response.status === 201) {
        console.log("Helu")
      toast({
        title: "Account Created"
      });
      navigate(0);
    } else {
        toast({
            title: "Could not create account",
            variant: "destructive"
        })
    }

  };

  return (
    <Tabs defaultValue="learner" className="w-11/12">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="learner">Learner</TabsTrigger>
        <TabsTrigger value="tutor">Tutor</TabsTrigger>
      </TabsList>
      <TabsContent value="learner">
        <Card>
          <CardHeader>
            <CardTitle>Learner Signup</CardTitle>
            <CardDescription>Create a Learner Account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {
              <SignupFields
                key={"learner"}
                info={learnerInfo}
                setInfo={setLearnerInfo}
              />
            }
          </CardContent>
          <CardFooter>
            <Button
              disabled={
                isDisabled(learnerInfo) ||
                learnerInfo.password !== learnerInfo.password_ ||
                isSigningIn
              }
              onClick={() => handleSignup(learnerInfo, "learner")}
            >
              Signup
            </Button>
            {isSigningIn && <Spinner />}
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="tutor">
        <Card>
          <CardHeader>
            <CardTitle>Tutor Signup</CardTitle>
            <CardDescription>Create a tutor account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {
              <SignupFields
                key={"tutor"}
                info={tutorInfo}
                setInfo={setTutorInfo}
              />
            }
          </CardContent>
          <CardFooter>
            <Button
              disabled={
                isDisabled(tutorInfo) ||
                tutorInfo.password !== tutorInfo.password_ ||
                isSigningIn
              }
              onClick={() => handleSignup(tutorInfo, "tutor")}
            >
              Signup
            </Button>
            {isSigningIn && <Spinner />}
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const LoginCard = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useUser();
  const { toast } = useToast();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Log in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="aargeee"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={async () => {
            setIsLoggingIn(true);
            try {
              await login(username, password);
              toast({
                variant: "default",
                title: "Login Successful",
              });
            } catch (error) {
              setPassword("");
              toast({
                variant: "destructive",
                title: error instanceof Error ? error.message : String(error),
                action: (
                  <ToastAction
                    altText="Try again"
                    onClick={() => setPassword("")}
                  >
                    Try again
                  </ToastAction>
                ),
              });
            }
            setIsLoggingIn(false);
          }}
          disabled={username === "" || password === "" || isLoggingIn}
        >
          Login
        </Button>
        {isLoggingIn && <Spinner />}
      </CardFooter>
    </Card>
  );
};

export function AuthPage() {
  const { user } = useUser();
  if (user === null)
    return (
      <div className="h-full py-12">
        <Tabs
          defaultValue="login"
          className="w-full sm:w-1/3 h-full ml-auto mr-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">{LoginCard()}</TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>Signup to AcadMe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex justify-center">
                {<SignupTabs />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );

  return <Navigate to={"/"} replace={true} />;
}

export default AuthPage;
