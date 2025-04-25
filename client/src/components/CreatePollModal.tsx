import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, XCircle, ClipboardList } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
}

export default function CreatePollModal({ isOpen, onClose, onPollCreated }: CreatePollModalProps) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [formOptions, setFormOptions] = useState<string[]>(["", ""]);

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
  
  const handleCloseModal = () => {
    form.reset();
    setFormOptions(["", ""]);
    onClose();
  };

  const onSubmit = async (values: CreatePollFormValues) => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    try {
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
      
      await apiRequest("POST", "/api/polls", pollData);
      
      toast({
        title: "Success",
        description: "Poll created successfully!",
      });
      
      handleCloseModal();
      onPollCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create poll",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center">
            <div className="mr-4 bg-primary-100 p-2 rounded-full text-primary-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <DialogTitle>Create New Poll</DialogTitle>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Type your question here..." 
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
              <Label>Options</Label>
              <div className="space-y-2 mt-1.5">
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
                className="mt-2"
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
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Create Poll</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
