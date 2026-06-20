"use client";

import { useState } from "react";

interface StaffMember {
  id: number;
  name: string;
  position: string;
  available: boolean;
  phone: string;
  email: string;
}

const MOCK_STAFF: StaffMember[] = [
  {
    id: 1,
    name: "Tatyana Dmytrenko",
    position: "Senior Veterinarian",
    available: true,
    phone: "987678909",
    email: "example@gmail.com",
  },
  {
    id: 2,
    name: "John Smith",
    position: "Veterinarian",
    available: false,
    phone: "123456789",
    email: "john@gmail.com",
  },
];

export default function StaffTable() {
  const [staff] =
    useState<StaffMember[]>(
      MOCK_STAFF
    );

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f8f8f8]">
            <th className="p-4 text-left">
              Name
            </th>

            <th className="p-4 text-left">
              Position
            </th>

            <th className="p-4 text-left">
              Available
            </th>

            <th className="p-4 text-left">
              Phone
            </th>

            <th className="p-4 text-left">
              Email
            </th>
          </tr>
        </thead>

        <tbody>
          {staff.map((member) => (
            <tr
              key={member.id}
              className="border-t"
            >
              <td className="p-4">
                {member.name}
              </td>

              <td className="p-4">
                {member.position}
              </td>

              <td className="p-4">
                {member.available
                  ? "Yes"
                  : "No"}
              </td>

              <td className="p-4">
                {member.phone}
              </td>

              <td className="p-4">
                {member.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}