import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAgentContext } from './AgentContext';
import { Agent, Department } from './AgentModel';

export const AgentManagement: React.FC = () => {
  const { 
    agentManager, 
    currentDepartment, 
    currentAgent, 
    selectDepartment, 
    selectAgent 
  } = useAgentContext();

  // Get all departments
  const departments = Array.from(agentManager.departments.values());

  // Handle department selection
  const handleDepartmentChange = (departmentId: string) => {
    selectDepartment(departmentId);
  };

  // Handle agent selection
  const handleAgentChange = (agentId: string) => {
    selectAgent(agentId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Management</h1>

      {/* Department Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Select Department</CardTitle>
          <CardDescription>Choose the department you want to explore</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleDepartmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept: Department) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Agent Selection */}
      {currentDepartment && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Select Agent</CardTitle>
            <CardDescription>
              Choose an agent from the {currentDepartment.name} department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              onValueChange={handleAgentChange}
              disabled={!currentDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {currentDepartment.agents.map((agent: Agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} - {agent.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Agent Details */}
      {currentAgent && (
        <Card>
          <CardHeader>
            <CardTitle>{currentAgent.name}</CardTitle>
            <CardDescription>{currentAgent.role} in {currentDepartment?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Specialization</h3>
                <p>{currentAgent.specialization}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Capabilities</h3>
                <ul className="list-disc pl-5">
                  {currentAgent.capabilities.map((capability) => (
                    <li key={capability.id}>{capability.name}</li>
                  ))}
                </ul>
              </div>

              {currentAgent.performanceMetrics && (
                <div>
                  <h3 className="font-semibold mb-2">Performance</h3>
                  <p>Completed Tasks: {currentAgent.performanceMetrics.completedTasks}</p>
                  <p>Satisfaction Score: {currentAgent.performanceMetrics.customerSatisfactionScore}%</p>
                  <p>Avg. Response Time: {currentAgent.performanceMetrics.responseTime} mins</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Accessible Tools</h3>
                <ul className="list-disc pl-5">
                  {currentAgent.accessibleTools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};