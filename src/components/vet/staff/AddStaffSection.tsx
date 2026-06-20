"use client";

import { useState } from "react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";

import StaffAvatarUpload from "./StaffAvatarUpload";
import StaffMultiSelect from "./StaffMultiSelect";
import { useCreateStaff } from "@/hooks/useCreateStaff";

import { POSITIONS, WORKING_DAYS } from "./constants";

export default function AddStaffSection() {
  const { mutate, loading } = useCreateStaff();

  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [position, setPosition] = useState<string>("");

  const [governmentIdScan, setGovernmentIdScan] = useState<File | null>(null);
  const [licenceScan, setLicenceScan] = useState<File | null>(null);

  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState({
    start: "",
    end: "",
  });

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    formData.append("position", position);
    formData.append("workingDays", JSON.stringify(workingDays));
    formData.append("workingHours", JSON.stringify(workingHours));

    if (governmentIdScan) {
      formData.append("governmentIdScan", governmentIdScan);
    }

    if (licenceScan) {
      formData.append("licenceScan", licenceScan);
    }

    await mutate(formData);
  };

  return (
    <section className="w-full">
      <Card className="p-6 md:p-8">
        <h2 className="mb-6 text-xl font-semibold">
          Add Staff Member
        </h2>

        {/* ========================= */}
        {/* MAIN LAYOUT: 2 COLUMNS */}
        {/* ========================= */}
        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8"
        >

          {/* ========================= */}
          {/* LEFT COLUMN: AVATAR ONLY */}
          {/* ========================= */}
          <div>
            <StaffAvatarUpload
              imageUrl={avatarUrl}
              onChange={(file) => {
                if (!file) return;
                setAvatarUrl(URL.createObjectURL(file));
              }}
            />
          </div>

          {/* ========================= */}
          {/* RIGHT COLUMN: FORM */}
          {/* ========================= */}
          <div className="grid gap-6">

            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input name="name" label="Name *" required />
              <Input type="date" name="dateOfBirth" label="Birth Date *" />
              <Select name="available" label="Availability">
                <option value="true">Available</option>
                <option value="false">Not available</option>
              </Select>
            </div>

            {/* GOVERNMENT ID (UNDER NAME BLOCK) */}
            <Input
              type="file"
              label="Government ID Scan"
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                setGovernmentIdScan(e.target.files?.[0] || null)
              }
            />

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input name="phoneNumber" label="Phone *" required />
              <Input name="email" label="Email *" required />
              <Input name="website" label="Website" />
              <Input name="socialLinks" label="Social Links" />
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input name="educationDegree" label="Degree" />
              <Input name="university" label="University" />
              <Input name="graduationYear" label="Graduation Year" />
            </div>

            {/* ROW 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="veterinaryLicenseNumber"
                label="License Number *"
                required
              />
              <Input
                name="licenseIssuingAuthority"
                label="Authority *"
                required
              />
              <Input type="date" name="validFrom" label="Valid From *" />
            </div>

            {/* LICENCE SCAN UNDER LICENSE BLOCK */}
            <Input
              type="file"
              label="Licence Scan"
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                setLicenceScan(e.target.files?.[0] || null)
              }
            />

            {/* ROW 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="position"
                label="Position *"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              >
                <option value="">Select position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>

              <Select
                name="emergencyAvailability"
                label="Emergency Availability"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>

            {/* WORKING DAYS */}
            <StaffMultiSelect
              label="Working Days"
              options={WORKING_DAYS}
              values={workingDays}
              onChange={setWorkingDays}
            />

            {/* WORKING HOURS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="time"
                label="From"
                value={workingHours.start}
                onChange={(e) =>
                  setWorkingHours((p) => ({
                    ...p,
                    start: e.target.value,
                  }))
                }
              />

              <Input
                type="time"
                label="To"
                value={workingHours.end}
                onChange={(e) =>
                  setWorkingHours((p) => ({
                    ...p,
                    end: e.target.value,
                  }))
                }
              />
            </div>

            {/* SUBMIT */}
            <div className="pt-6">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Add Staff"}
              </Button>
            </div>

          </div>
        </form>
      </Card>
    </section>
  );
}