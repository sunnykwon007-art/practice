import { createClient } from "@supabase/supabase-js";
import { UniversityData } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 초기화 (환경변수 확인)
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Supabase 연결 여부
export const isSupabaseAvailable = supabaseUrl && supabaseKey && supabase;

// 모든 데이터 조회
export async function getAllData(): Promise<UniversityData[]> {
  try {
    if (!isSupabaseAvailable) {
      console.warn("Supabase 미연결 - 초기 데이터로 대체됨");
      return [];
    }

    const { data, error } = await supabase!
      .from("universities")
      .select("*")
      .order("school_name", { ascending: true });

    if (error) {
      console.error("Supabase 조회 오류:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("데이터 조회 실패:", error);
    return [];
  }
}

// 단일 데이터 추가
export async function addUniversity(data: UniversityData) {
  try {
    if (!isSupabaseAvailable) {
      console.warn("Supabase 미연결 - 데이터는 로컬에만 저장됨");
      return data;
    }

    const { data: result, error } = await supabase!
      .from("universities")
      .insert([data])
      .select();

    if (error) {
      console.error("Supabase 추가 오류:", error);
      throw error;
    }

    return result?.[0] || null;
  } catch (error) {
    console.error("데이터 추가 실패:", error);
    return null;
  }
}

// 데이터 업데이트
export async function updateUniversity(id: string, data: Partial<UniversityData>) {
  try {
    if (!isSupabaseAvailable) {
      console.warn("Supabase 미연결 - 데이터는 로컬에만 저장됨");
      return data;
    }

    const { data: result, error } = await supabase!
      .from("universities")
      .update(data)
      .eq("school_id", id)
      .select();

    if (error) {
      console.error("Supabase 업데이트 오류:", error);
      throw error;
    }

    return result?.[0] || null;
  } catch (error) {
    console.error("데이터 업데이트 실패:", error);
    return null;
  }
}

// 데이터 삭제
export async function deleteUniversity(id: string) {
  try {
    if (!isSupabaseAvailable) {
      console.warn("Supabase 미연결 - 로컬에서만 삭제됨");
      return true;
    }

    const { error } = await supabase!
      .from("universities")
      .delete()
      .eq("school_id", id);

    if (error) {
      console.error("Supabase 삭제 오류:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("데이터 삭제 실패:", error);
    return false;
  }
}

// 실시간 구독 (선택사항)
export function subscribeToChanges(callback: (data: UniversityData[]) => void) {
  if (!isSupabaseAvailable) {
    console.warn("Supabase 미연결 - 실시간 구독 불가능");
    return null;
  }

  const subscription = supabase!
    .channel("universities_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "universities" },
      () => {
        getAllData().then(callback);
      }
    )
    .subscribe();

  return subscription;
}
