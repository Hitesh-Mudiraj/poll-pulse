import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";
import { PollWithOptions, pollDurationSchema } from "@shared/schema";

interface CreatePollFormProps {
  onSuccess?: () => void;
}

const createPollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters").max(200, "Question must be less than 200 characters"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
  duration: pollDurationSchema,
  visibility: z.enum(["public", "private"]),
  isMultipleChoice: z.boolean().default(false),
});

type CreatePollFormValues = z.infer<typeof createPollSchema>;

const CreatePollForm = ({ onSuccess }: CreatePollFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [optionInputs, setOptionInputs] = useState<string[]>(["", ""]);

  const form = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: "",
      options: ["", ""],
      duration: "1w",
      visibility: "public",
      isMultipleChoice: false,
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: CreatePollFormValues) => {
      const response = await apiRequest("POST", "/api/polls", data);
      return response.json();
    },
    onSuccess: (data: { poll: PollWithOptions }) => {
      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls/my"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create poll",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const handleAddOption = () => {
    const newOptions = [...optionInputs, ""];
    setOptionInputs(newOptions);
    form.setValue("options", newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (optionInputs.length <= 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A poll must have at least 2 options",
      });
      return;
    }
    
    const newOptions = optionInputs.filter((_, i) => i !== index);
    setOptionInputs(newOptions);
    form.setValue("options", newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...optionInputs];
    newOptions[index] = value;
    setOptionInputs(newOptions);
    form.setValue("options", newOptions);
  };

  const onSubmit = (data: CreatePollFormValues) => {
    // Filter out empty options
    const options = data.options.filter(option => option.trim() !== "");
    
    if (options.length < 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A poll must have at least 2 options",
      });
      return;
    }
    
    createPollMutation.mutate({
      ...data,
      options,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your question here"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Options</FormLabel>
          <div className="space-y-3">
            {optionInputs.map((option, index) => (
              <div key={index} className="flex items-center">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="mt-2 text-primary hover:text-primary-600"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Option
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="3d">3 days</SelectItem>
                    <SelectItem value="1w">1 week</SelectItem>
                    <SelectItem value="2w">2 weeks</SelectItem>
                    <SelectItem value="1m">1 month</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isMultipleChoice"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Allow multiple selections</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createPollMutation.isPending}
          >
            {createPollMutation.isPending ? "Creating..." : "Create Poll"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreatePollForm;
