// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(request: Request) {
  const { username, firstName, lastName, email, password } = await request.json();

  // Sign up ผู้ใช้ด้วยอีเมลและรหัสผ่าน
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // ถ้า sign up สำเร็จ ให้เพิ่มข้อมูลโปรไฟล์ของผู้ใช้
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')  // สมมติว่ามี table ชื่อ 'profiles' เพื่อเก็บข้อมูลโปรไฟล์ผู้ใช้
      .insert([
        {
          id: data.user.id,  // ใช้ user id จาก Supabase
          username: username,
          first_name: firstName,
          last_name: lastName,
          email: email
        }
      ]);

    if (profileError) {
      return NextResponse.json({ message: profileError.message }, { status: 400 });
    }
  }

  // แจ้งให้ผู้ใช้ตรวจสอบอีเมลสำหรับการยืนยัน
  return NextResponse.json({
    message: `Signup successful! Please check your email (${data.user?.email}) for confirmation.`,
  });
}
