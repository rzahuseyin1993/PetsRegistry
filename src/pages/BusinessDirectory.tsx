import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CmsRenderer from "@/components/CmsRenderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Phone, Globe, Mail, Star, Building2, Check, X, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "pet_shop", label: "Pet Shop" },
  { value: "veterinary", label: "Veterinary" },
  { value: "grooming", label: "Grooming" },
  { value: "boarding", label: "Boarding" },
  { value: "training", label: "Training" },
  { value: "pet_food", label: "Pet Food" },
  { value: "other", label: "Other" },
];

const BusinessDirectory = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["business-listings", search, category],
    queryFn: async () => {
      let query = supabase
        .from("business_listings")
        .select("*")
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("is_paid", { ascending: false })
        .order("created_at", { ascending: false });

      if (category !== "all") {
        query = query.eq("category", category);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CmsRenderer slug="directory" fallback={
      <>
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="container text-center">
          <h1 className="font-display text-4xl font-bold text-foreground">Pet Business Directory</h1>
          <p className="mt-3 text-lg text-muted-foreground">Find local pet shops, vets, groomers and more</p>
          <div className="mx-auto mt-8 flex max-w-2xl gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48 p-6" />
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No businesses found</h3>
            <p className="mt-1 text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing: any) => (
              <Card key={listing.id} className={`group transition-all hover:shadow-lg ${listing.is_featured ? "border-accent ring-1 ring-accent/30" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {listing.is_paid ? (
                          <Link to={`/directory/${listing.id}`} className="font-display text-lg font-bold text-foreground hover:text-primary transition-colors">
                            {listing.name}
                          </Link>
                        ) : (
                          <h3 className="font-display text-lg font-bold text-foreground">{listing.name}</h3>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {listing.is_featured && (
                          <Badge className="bg-accent text-accent-foreground"><Star className="mr-1 h-3 w-3" />Featured</Badge>
                        )}
                        {listing.is_paid && (
                          <Badge variant="secondary" className="text-primary">Verified Partner</Badge>
                        )}
                        <Badge variant="outline">{categories.find(c => c.value === listing.category)?.label || listing.category}</Badge>
                      </div>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  )}

                  <div className="mt-4 space-y-1.5">
                    {listing.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{listing.address}{listing.city ? `, ${listing.city}` : ""}</span>
                      </div>
                    )}
                    {listing.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{listing.phone}</span>
                      </div>
                    )}
                    {listing.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{listing.email}</span>
                      </div>
                    )}
                    {listing.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <a href={listing.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary">{listing.website}</a>
                      </div>
                    )}
                  </div>

                  {listing.is_paid && (
                    <Link to={`/directory/${listing.id}`}>
                      <Button variant="outline" size="sm" className="mt-4 w-full">View Full Profile</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Free vs Paid comparison */}
      <div className="border-t bg-muted/30 py-16">
        <div className="container max-w-4xl">
          <div className="text-center">
            <Crown className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">List Your Business</h2>
            <p className="mt-2 text-muted-foreground">Choose the plan that's right for your business</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Free Plan */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground">Free Listing</h3>
                <p className="mt-1 text-2xl font-bold text-foreground">$0<span className="text-sm font-normal text-muted-foreground">/forever</span></p>
                <ul className="mt-5 space-y-3">
                  <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />Business name & description</li>
                  <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />Category listing</li>
                  <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />Address & contact info</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50" />Dedicated profile page</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50" />Photo gallery</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50" />WhatsApp & Email buttons</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50" />"Verified Partner" badge</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50" />Priority placement</li>
                </ul>
                <Link to="/login">
                  <Button variant="outline" className="mt-6 w-full">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Paid Plan */}
            <Card className="border-accent ring-1 ring-accent/30">
              <CardContent className="relative p-6">
                <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                  <Star className="mr-1 inline h-3 w-3" />Recommended
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Verified Partner</h3>
                <p className="mt-1 text-2xl font-bold text-foreground">$5<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                <ul className="mt-5 space-y-3">
                  <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />Everything in Free</li>
                  <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" />Dedicated profile page</li>
                  <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" />Photo gallery uploads</li>
                  <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" />WhatsApp & Email contact buttons</li>
                  <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" />"Verified Partner" badge</li>
                  <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" />Priority listing placement</li>
                  <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" />Featured on top of results</li>
                </ul>
                <Link to="/membership">
                  <Button className="mt-6 w-full gap-2">Become a Partner <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </>
      } />
      <Footer />
    </div>
  );
};

export default BusinessDirectory;
