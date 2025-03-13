import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { aiService } from "@/lib/ai";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { AgentStatus as AgentStatusType } from "@/lib/ai/types";

export function AgentStatus() {
  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["agent-status"],
    () => aiService.getAgentStatuses(),
    { refetchInterval: 30000 }, // Refresh every 30 seconds
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Agents Status</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Agents Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <h3 className="font-medium text-lg">Error Loading Agent Status</h3>
            <p className="text-muted-foreground mb-4">
              There was a problem connecting to the AI agents system.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agents Status</CardTitle>
        <CardDescription>
          Current status of all AI agents in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Manager Status</h3>
              <StatusBadge status={status?.manager.status || "inactive"} />
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">{status?.manager.description}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <span className="flex items-center">
                  {status?.manager.usingMockResponses ? (
                    <>
                      <Badge variant="outline" className="mr-2">
                        Mock Mode
                      </Badge>
                      Using simulated responses for demonstration
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="mr-2">
                        Live Mode
                      </Badge>
                      Connected to AI service
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-lg">Department Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(status?.departments || {}).map(
                ([dept, info]: [string, any]) => (
                  <div
                    key={dept}
                    className="flex flex-col p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{dept}</span>
                      <StatusBadge status={info.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {info.description}
                    </p>
                    {info.usingMockResponses && (
                      <span className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="mr-1">
                          Mock
                        </Badge>
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
  }
}
