import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { XCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Categories
const categories = [
  "Technology",
  "Food",
  "Entertainment",
  "Sports",
  "Education",
  "Travel",
  "Other"
];

// Validation schema
const createPollSchema = z.object({
  title: z.string().min(5, "Question must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
  endDate: z.string().optional(),
  allowMultiple: z.boolean().optional(),
  allowComments: z.boolean().optional(),
});

type CreatePollFormValues = z.infer<typeof createPollSchema>;

export default function CreatePoll() {
  const [, navigate] = useLocation();
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [formOptions, setFormOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: "",
      category: "",
      options: ["", ""],
      endDate: "",
      allowMultiple: false,
      allowComments: true,
    },
  });

  const addOption = () => {
    const newOptions = [...formOptions, ""];
    setFormOptions(newOptions);
    form.setValue("options", newOptions);
  };
  
  const removeOption = (index: number) => {
    if (formOptions.length <= 2) return;
    
    const newOptions = formOptions.filter((_, i) => i !== index);
    setFormOptions(newOptions);
    form.setValue("options", newOptions);
  };
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...formOptions];
    newOptions[index] = value;
    setFormOptions(newOptions);
    form.setValue("options", newOptions);
  };

  const onSubmit = async (values: CreatePollFormValues) => {
    if (!user) {
      openAuthModal();
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Filter out empty options
      const filteredOptions = values.options.filter(opt => opt.trim() !== "");
      if (filteredOptions.length < 2) {
        toast({
          title: "Error",
          description: "At least 2 non-empty options are required",
          variant: "destructive",
        });
        return;
      }
      
      // Format data for API
      const pollData = {
        title: values.title,
        category: values.category,
        options: filteredOptions,
        allow_multiple: values.allowMultiple,
        allow_comments: values.allowComments,
        end_date: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      };
      
      const response = await apiRequest("POST", "/api/polls", pollData);
      const newPoll = await response.json();
      
      toast({
        title: "Success!",
        description: "Your poll has been created successfully.",
      });
      
      // Redirect to the new poll
      navigate(`/poll/${newPoll.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create poll",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Content Header */}
      <header className="bg-white shadow-sm lg:pl-0 lg:pr-6 pt-4 pb-4 flex items-center justify-between lg:border-b hidden lg:flex">
        <div className="px-4 md:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create Poll</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 lg:py-8 md:px-6 lg:px-8 bg-gray-50 mt-16 lg:mt-0">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create Poll</h1>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Poll</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What would you like to ask?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Options</FormLabel>
                    <div className="space-y-3 mt-1.5">
                      {formOptions.map((option, index) => (
                        <div key={index} className="flex">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="ml-2"
                            onClick={() => removeOption(index)}
                            disabled={formOptions.length <= 2}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {form.formState.errors.options && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.options.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={addOption}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <FormField
                      control={form.control}
                      name="allowMultiple"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Allow multiple selections</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allowComments"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Allow comments</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                
                  <CardFooter className="flex justify-end space-x-4 px-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Poll..." : "Create Poll"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
