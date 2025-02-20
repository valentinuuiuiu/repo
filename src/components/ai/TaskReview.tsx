import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Task } from "@/lib/ai/types";

interface TaskReviewProps {
  task: Task;
  onApprove: (feedback: { comments: string; modifications?: any }) => void;
  onReject: (feedback: { comments: string }) => void;
}

export function TaskReview({ task, onApprove, onReject }: TaskReviewProps) {
  const [feedback, setFeedback] = useState("");
  const [modifications, setModifications] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Task Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Task Type</h3>
          <p>{task.type}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Departments Involved</h3>
          <p>{task.departments.join(", ")}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Results</h3>
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            {JSON.stringify(task.result, null, 2)}
          </pre>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Your Feedback</h3>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide your feedback..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Suggested Modifications (JSON)</h3>
          <Textarea
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
            placeholder='{"key": "value"}'
            className="font-mono"
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            variant="default"
            onClick={() =>
              onApprove({
                comments: feedback,
                modifications: modifications
                  ? JSON.parse(modifications)
                  : undefined,
              })
            }
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            onClick={() => onReject({ comments: feedback })}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
