"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSimulatedTicket, updateTicketStatus } from "@/lib/db";

export async function updateTicketStatusAction(ticketId: number, status: "open" | "investigating" | "waiting_on_customer" | "escalated" | "resolved") {
  updateTicketStatus(ticketId, status);
  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath("/investigations");
  revalidatePath("/case-studies");
  revalidatePath(`/tickets/${ticketId}`);
}

export async function generateNewTicketAction() {
  const ticketId = generateSimulatedTicket();
  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath("/investigations");
  revalidatePath("/case-studies");
  redirect(`/tickets/${ticketId}`);
}
