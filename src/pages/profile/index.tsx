import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth/supabase-auth";

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || "John Doe",
    email: user?.email || "john@example.com",
    phone: user?.user_metadata?.phone || "+1 (555) 123-4567",
    company: user?.user_metadata?.company || "My Dropshipping Company",
    bio:
      user?.user_metadata?.bio ||
      "Dropshipping entrepreneur passionate about e-commerce and finding the best products for my customers.",
    website: user?.user_metadata?.website || "https://mystore.com",
    avatar:
      user?.user_metadata?.avatar ||
      "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description:
          error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    // In a real implementation, this would open a file picker
    // and upload the selected image to storage
    toast({
      title: "Avatar upload",
      description: "This feature is not implemented in the demo.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={profileData.avatar}
                    alt={profileData.name}
                  />
                  <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={handleAvatarUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profileData.email}
                  </p>
                </div>
                <Separator />
                <div className="w-full space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-muted-foreground">
                      Jan 2023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Subscription</span>
                    <span className="text-sm text-muted-foreground">
                      Professional
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Products</span>
                    <span className="text-sm text-muted-foreground">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Orders</span>
                    <span className="text-sm text-muted-foreground">1,358</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    Manage your business information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <select
                        id="businessType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="sole_proprietor"
                      >
                        <option value="sole_proprietor">
                          Sole Proprietorship
                        </option>
                        <option value="llc">LLC</option>
                        <option value="corporation">Corporation</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / EIN</Label>
                      <Input
                        id="taxId"
                        placeholder="XX-XXXXXXX"
                        defaultValue="12-3456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <select
                        id="industry"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="ecommerce"
                      >
                        <option value="ecommerce">E-commerce</option>
                        <option value="retail">Retail</option>
                        <option value="technology">Technology</option>
                        <option value="fashion">Fashion</option>
                        <option value="health">Health & Beauty</option>
                        <option value="home">Home & Garden</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input
                      id="businessAddress"
                      placeholder="Street Address"
                      defaultValue="123 E-commerce St"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <Input placeholder="City" defaultValue="San Francisco" />
                      <Input placeholder="State" defaultValue="CA" />
                      <Input placeholder="ZIP Code" defaultValue="94105" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <Button className="mt-2">Update Password</Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account by enabling
                      two-factor authentication.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Sessions</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your active sessions and sign out from other
                      devices.
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Device
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Last Active
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-2"
                                >
                                  <rect
                                    width="14"
                                    height="20"
                                    x="5"
                                    y="2"
                                    rx="2"
                                    ry="2"
                                  />
                                  <path d="M12 18h.01" />
                                </svg>
                                iPhone (Current)
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              San Francisco, CA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              Just now
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="text-green-600 font-medium">
                                Current Session
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-2"
                                >
                                  <rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="3"
                                    rx="2"
                                    ry="2"
                                  />
                                  <line x1="8" x2="16" y1="21" y2="21" />
                                  <line x1="12" x2="12" y1="17" y2="21" />
                                </svg>
                                MacBook Pro
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              San Francisco, CA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              2 hours ago
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                Sign Out
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-2"
                                >
                                  <rect
                                    width="14"
                                    height="20"
                                    x="5"
                                    y="2"
                                    rx="2"
                                    ry="2"
                                  />
                                  <path d="M12 18h.01" />
                                </svg>
                                Android Phone
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              New York, NY
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              Yesterday
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                Sign Out
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2 text-red-500 hover:text-red-700"
                    >
                      Sign Out All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
