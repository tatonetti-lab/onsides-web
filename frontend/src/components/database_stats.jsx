"use server";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/lib/db";

export default async function DatabaseStats() {
  const stats = (await getDb())
    .prepare(
      `SELECT 
        (SELECT COUNT(rxnorm_id) FROM vocab_rxnorm_ingredient) as n_ingredients,
        (SELECT COUNT(rxnorm_id) FROM vocab_rxnorm_product) as n_products,
        (SELECT COUNT(meddra_id) FROM vocab_meddra_adverse_effect) as n_meddra,
        (SELECT COUNT(*) FROM product_adverse_effect) as n_adverse_effect_pairs
      ;`,
    )
    .all();

  return (
    <div className="flex flex-col gap-4">
      <h2>Basic Statistics</h2>
      <Table className="text-md">
        <TableHeader>
          <TableRow>
            <TableHead>Drug Products</TableHead>
            <TableHead>Ingredients</TableHead>
            <TableHead>Adverse Reactions</TableHead>
            <TableHead>Drug/Adverse Reactions Pairs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{stats.n_products}</TableCell>
            <TableCell>{stats.n_ingredients}</TableCell>
            <TableCell>{stats.n_meddra}</TableCell>
            <TableCell>{stats.n_adverse_effect_pairs}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
