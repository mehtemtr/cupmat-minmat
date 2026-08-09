import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Delete from profiles
    const { data: data1, error: error1 } = await supabaseAdmin
      .from("profiles")
      .delete()
      .like("user_id", "bot_%");

    const { data: data2, error: error2 } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", "statmatik_bot");

    return NextResponse.json({ success: true, deleted1: data1, deleted2: data2, error1, error2 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
