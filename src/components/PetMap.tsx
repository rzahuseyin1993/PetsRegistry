import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Locate, MapPin } from "lucide-react";

type PlaceCategory = "veterinary" | "pet_shop" | "park" | "shelter" | "grooming";

type Place = {
  id: number;
  lat: number;
  lon: number;
  name: string;
  category: PlaceCategory;
  address?: string;
};

type Coordinates = {
  lat: number;
  lon: number;
};

const DEFAULT_CENTER: Coordinates = { lat: 1.3521, lon: 103.8198 };
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

const CATEGORY_META: Record<PlaceCategory, { emoji: string; color: string; label: string }> = {
  veterinary: { emoji: "🏥", color: "#ef4444", label: "Vets" },
  pet_shop: { emoji: "🛒", color: "#22c55e", label: "Pet Shops" },
  park: { emoji: "🌳", color: "#3b82f6", label: "Parks" },
  shelter: { emoji: "🏠", color: "#f59e0b", label: "Shelters" },
  grooming: { emoji: "✂️", color: "#a855f7", label: "Grooming" },
};

const createCategoryIcon = (category: PlaceCategory) => {
  const config = CATEGORY_META[category];

  return L.divIcon({
    className: "pet-map-marker",
    html: `<div style="background:${config.color};width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);">${config.emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

async function fetchNearbyPetPlaces(lat: number, lon: number, radius = 5000): Promise<Place[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="veterinary"](around:${radius},${lat},${lon});
      node["shop"="pet"](around:${radius},${lat},${lon});
      node["leisure"="dog_park"](around:${radius},${lat},${lon});
      node["leisure"="park"](around:${radius},${lat},${lon});
      node["animal_shelter"="yes"](around:${radius},${lat},${lon});
      node["shop"="pet_grooming"](around:${radius},${lat},${lon});
    );
    out body 80;
  `;

  const response = await fetch(OVERPASS_API, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pet map data");
  }

  const data = await response.json();

  return (data.elements || [])
    .filter((element: any) => element.tags?.name)
    .map((element: any) => {
      let category: PlaceCategory = "park";

      if (element.tags.amenity === "veterinary") category = "veterinary";
      else if (element.tags.shop === "pet") category = "pet_shop";
      else if (element.tags.shop === "pet_grooming") category = "grooming";
      else if (element.tags.animal_shelter === "yes") category = "shelter";

      return {
        id: element.id,
        lat: element.lat,
        lon: element.lon,
        name: element.tags.name,
        category,
        address: element.tags["addr:street"]
          ? `${element.tags["addr:housenumber"] || ""} ${element.tags["addr:street"]}`.trim()
          : undefined,
      } satisfies Place;
    });
}

const PetMap = () => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState<PlaceCategory | null>(null);

  const filteredPlaces = useMemo(
    () => (filter ? places.filter((place) => place.category === filter) : places),
    [filter, places],
  );

  const categories: Array<{ key: PlaceCategory | null; label: string }> = useMemo(
    () => [
      { key: null, label: "All" },
      { key: "veterinary", label: "🏥 Vets" },
      { key: "pet_shop", label: "🛒 Pet Shops" },
      { key: "park", label: "🌳 Parks" },
      { key: "shelter", label: "🏠 Shelters" },
      { key: "grooming", label: "✂️ Grooming" },
    ],
    [],
  );

  const loadPlaces = async (nextCenter: Coordinates) => {
    setLoading(true);
    try {
      const data = await fetchNearbyPetPlaces(nextCenter.lat, nextCenter.lon);
      setPlaces(data);
    } catch (error) {
      console.error("Failed to load pet places", error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      loadPlaces(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCenter(nextCenter);
        loadPlaces(nextCenter);
      },
      () => {
        loadPlaces(DEFAULT_CENTER);
      },
      { timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lon], 13, { animate: true });
  }, [center]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    filteredPlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lon], {
        icon: createCategoryIcon(place.category),
      });

      marker.bindPopup(`
        <div style="min-width:160px; font-family: system-ui, sans-serif;">
          <p style="margin:0; font-weight:600; font-size:14px; color:#111827;">${place.name}</p>
          <p style="margin:4px 0 0; font-size:12px; color:#6b7280; text-transform:capitalize;">${place.category.replace("_", " ")}</p>
          ${place.address ? `<p style="margin:6px 0 0; font-size:12px; color:#111827;">${place.address}</p>` : ""}
        </div>
      `);

      markerLayer.addLayer(marker);
    });

    if (filteredPlaces.length > 0) {
      const bounds = L.latLngBounds(filteredPlaces.map((place) => [place.lat, place.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
    }
  }, [filteredPlaces]);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCenter(nextCenter);
        void loadPlaces(nextCenter);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 5000 },
    );
  };

  return (
    <section id="pet-map" className="border-t border-border py-8 sm:py-16">
      <div className="container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl sm:text-3xl font-bold text-foreground">
              <MapPin className="h-5 w-5 sm:h-7 sm:w-7 text-primary" /> Pet Map
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Discover pet-friendly places near you
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto" onClick={handleLocate} disabled={locating}>
            <Locate className="h-4 w-4" />
            {locating ? "Locating..." : "Use My Location"}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((category) => (
            <Button
              key={category.label}
              variant={filter === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category.key)}
              className="rounded-full text-[11px] sm:text-xs h-7 sm:h-8 px-2.5 sm:px-3"
            >
              {category.label}
            </Button>
          ))}
          {!loading && (
            <span className="ml-1 sm:ml-2 flex items-center text-[11px] sm:text-xs text-muted-foreground">
              {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        <div className="mt-3 sm:mt-4 overflow-hidden rounded-xl border border-border shadow-sm h-[300px] sm:h-[450px]">
          <div ref={mapElementRef} className="h-full w-full" />
        </div>
      </div>
    </section>
  );
};

export default PetMap;
