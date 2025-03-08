"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { LayoutGrid, BarChart2, Users } from "lucide-react";

const data = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 800 },
    { name: "Mar", users: 1500 },
    { name: "Apr", users: 2000 },
];

export default function Dashboard() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/auth/signin');
        },
    });

    const [activeTab, setActiveTab] = useState("overview");

    // useEffect(() => {
    //   if (status === "loading") return;
    //   if (!session || session.user.role !== "admin") {
    //     redirect("/login");
    //   }
    // }, [session, status, router]);


    if (status === "loading") {
        return <p>Chargement...</p>;
    }


    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white p-4">
                <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
                <div className="mt-4">
                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="text-white hover:text-gray-300"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <button
                            onClick={() => signIn('github')}
                            className="text-white hover:text-gray-300"
                        >
                            Sign In
                        </button>
                    )}
                </div>
                <Menubar>
                    <MenubarMenu>
                        <MenubarContent>
                            <MenubarItem onClick={() => setActiveTab("overview")}>
                                <LayoutGrid className="mr-2" /> Dashboard
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarContent>
                            <MenubarItem onClick={() => setActiveTab("analytics")}>
                                <BarChart2 className="mr-2" /> Analytics
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarContent>
                            <MenubarItem onClick={() => setActiveTab("users")}>
                                <Users className="mr-2" /> Users
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100">
                {activeTab === "overview" && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Overview</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent>
                                    <p className="text-lg font-semibold">Total Users</p>
                                    <p className="text-2xl">5,432</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <p className="text-lg font-semibold">New Signups</p>
                                    <p className="text-2xl">1,234</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">User Growth</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#555" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="users" fill="#8884d8" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
