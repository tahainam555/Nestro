import sofa from "@/assets/product-sofa.jpg";
import table from "@/assets/product-table.jpg";
import vase from "@/assets/product-vase.jpg";
import lamp from "@/assets/product-lamp.jpg";
import rug from "@/assets/product-rug.jpg";
import shelf from "@/assets/product-shelf.jpg";
import japandi from "@/assets/style-japandi.jpg";
import wabi from "@/assets/style-wabi.jpg";
import mediterranean from "@/assets/style-mediterranean.jpg";
import scandi from "@/assets/style-scandi.jpg";
import organic from "@/assets/style-organic.jpg";
import boho from "@/assets/style-boho.jpg";
import type { Product } from "@/store/forma";

export const styleImages: Record<string, string> = {
  japandi,
  wabi,
  mediterranean,
  scandi,
  organic,
  boho,
};

export const styles = [
  { id: "japandi",       name: "Japandi",          desc: "QUIET · WARM · MINIMAL",       image: japandi },
  { id: "wabi",          name: "Wabi-Sabi",         desc: "RAW · IMPERFECT · STILL",       image: wabi },
  { id: "organic",       name: "Organic Modern",    desc: "CURVED · TACTILE · LIGHT",      image: organic },
  { id: "scandi",        name: "Nordic Forest",     desc: "LIGHT WOOD · LINEN · CALM",     image: scandi },
  { id: "mediterranean", name: "Mediterranean",     desc: "LIME · OLIVE · CLAY",           image: mediterranean },
  { id: "boho",          name: "Biophilic Boho",    desc: "GREEN · WOVEN · WARM",          image: boho },
];

export const products: Product[] = [
  { id: "s1",  name: "Linné Boucle Sofa",          vendor: "ATELIER NORD",      price: 2890, match: 96.4, category: "Seating",  reason: "Sculpts negative space against your shelf wall while echoing the linen tone you already have.",      image: sofa },
  { id: "t1",  name: "Travertine Disc Table",       vendor: "STUDIO HEMSTEAD",   price: 1240, match: 93.1, category: "Tables",   reason: "Stone weight grounds a high-light room — its curve answers the sofa's geometry.",                   image: table },
  { id: "v1",  name: "Hand-thrown Stoneware Vase",  vendor: "KILN & CLAY",       price: 168,  match: 91.7, category: "Decor",    reason: "Hand-marks introduce the wabi-sabi imperfection your brief asked for.",                            image: vase },
  { id: "l1",  name: "Paper Pendant 80",            vendor: "NOGUCHI HERITAGE",  price: 540,  match: 90.2, category: "Lighting", reason: "Diffuses the high natural index into a softer evening glow.",                                      image: lamp },
  { id: "r1",  name: "Jute Field Rug 200×300",      vendor: "ARMADIO",           price: 720,  match: 88.5, category: "Textiles", reason: "Defines the seating zone without competing with the wood floor.",                                  image: rug },
  { id: "sh1", name: "Oak Etagere Tall",            vendor: "FORMA EDITIONS",    price: 1620, match: 87.0, category: "Storage",  reason: "Open structure preserves the room's verticality and natural light flow.",                          image: shelf },
];

export const agents = [
  { id: "spatial",  name: "Spatial Reader",  task: "Mapping volume, light, sightlines" },
  { id: "style",    name: "Style Curator",   task: "Cross-referencing material palette" },
  { id: "source",   name: "Source Scout",    task: "Surveying 1,400+ ateliers" },
  { id: "harmonic", name: "Harmonic Critic", task: "Balancing weight, color, rhythm" },
];
