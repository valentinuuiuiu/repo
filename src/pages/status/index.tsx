import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  Server,
  Cloud,
  Database,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const StatusPage = () => {
  const getStatusIcon = (status: 'operational' | 'degraded' | 'outage') => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const services = [
    {
      icon: <Cloud className="h-6 w-6 text-primary" />,
      name: "API Services",
      status: 'operational' as const,
      uptime: "99.99%",
      lastIncident: "None"
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      name: "Database Clusters",
      status: 'operational' as const,
      uptime: "99.95%",
      lastIncident: "3 days ago"
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      name: "CDN",
      status: 'operational' as const,
      uptime: "99.99%",
      lastIncident: "7 days ago"
    },
    {
      icon: <Server className="h-6 w-6 text-primary" />,
      name: "Web Application",
      status: 'operational' as const,
      uptime: "99.98%",
      lastIncident: "2 days ago"
    }
  ];

  const recentIncidents = [
    {
      date: "2024-02-23",
      title: "API Response Time Degradation",
      status: 'resolved',
      duration: "23 minutes",
      description: "Some API endpoints experienced increased latency due to database optimization."
    },
    {
      date: "2024-02-20",
      title: "CDN Performance Issues",
      status: 'resolved',
      duration: "15 minutes",
      description: "Users experienced slower content delivery in certain regions."
    }
  ];

  const maintenanceWindows = [
    {
      date: "2024-03-01",
      time: "02:00 - 04:00 UTC",
      description: "Scheduled database maintenance and optimization"
    },
    {
      date: "2024-03-15",
      time: "01:00 - 03:00 UTC",
      description: "System upgrades and security patches"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">System Status</h1>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-lg">All systems operational</p>
          </div>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Services Status */}
        <h2 className="text-2xl font-bold mb-6">Service Status</h2>
        <div className="grid gap-6 mb-12">
          {services.map((service, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(service.status)}
                        <span className="text-sm text-muted-foreground">{service.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Uptime</div>
                    <div className="text-2xl font-bold text-primary">{service.uptime}</div>
                    <div className="text-sm text-muted-foreground">
                      Last incident: {service.lastIncident}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Incidents */}
        <h2 className="text-2xl font-bold mb-6">Recent Incidents</h2>
        <div className="space-y-6 mb-12">
          {recentIncidents.map((incident, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{incident.status}</Badge>
                      <span className="text-sm text-muted-foreground">{incident.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
                    <p className="text-muted-foreground">{incident.description}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {incident.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scheduled Maintenance */}
        <h2 className="text-2xl font-bold mb-6">Scheduled Maintenance</h2>
        <div className="space-y-4">
          {maintenanceWindows.map((maintenance, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{maintenance.date}</span>
                      <span className="text-muted-foreground">{maintenance.time}</span>
                    </div>
                    <p className="text-muted-foreground">{maintenance.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;