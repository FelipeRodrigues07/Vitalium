"use client"

import { useState, type FormEvent } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserService } from "@/services/api/users/CreateUser"
import { CreatePatientService } from "@/services/api/patients/CreatePatient"
import { patientDoctorApi } from "@/services/api/patient-doctors/patientsByDoctor"
import type { DoctorListItemModel } from "@/services/api/doctors/GetDoctors"
import { useSecretaryActiveUnit } from "@/components/secretary/secretary-unit-provider"

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11) return digits
  if (digits.length === 13 && digits.startsWith("55")) return digits.slice(2)
  return digits
}

interface SecretaryPatientFormProps {
  doctors: DoctorListItemModel[]
  onCreated: () => void
}

export function SecretaryPatientForm({
  doctors,
  onCreated,
}: SecretaryPatientFormProps) {
  const { activeUnitId } = useSecretaryActiveUnit()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [cpf, setCpf] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE")
  const [doctorId, setDoctorId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setCpf("")
    setBirthDate("")
    setGender("MALE")
    setDoctorId("")
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const phoneDigits = normalizePhone(phone)
    if (phoneDigits.length !== 11) {
      setError("Telefone deve ter 11 dígitos (ex.: 62999999999).")
      return
    }

    const cpfDigits = cpf.replace(/\D/g, "")
    if (cpfDigits.length !== 11) {
      setError("CPF deve conter exatamente 11 dígitos.")
      return
    }

    if (!birthDate) {
      setError("Informe a data de nascimento.")
      return
    }

    if (!activeUnitId) {
      setError("Selecione uma unidade no topo da tela.")
      return
    }

    try {
      setSubmitting(true)
      const createdUser = await CreateUserService.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phoneDigits,
        role: "PATIENT",
        password,
        isActive: true,
      })

      const patient = await CreatePatientService.createPatient({
        userId: createdUser.id,
        cpf: cpfDigits,
        birthDate,
        gender,
        unitId: activeUnitId,
        isPrimary: true,
      })

      if (doctorId && doctorId !== "none") {
        await patientDoctorApi.create({
          patientId: patient.id,
          doctorId,
          unitId: activeUnitId,
        })
      }

      setSuccess(`Paciente ${createdUser.firstName} cadastrado na unidade.`)
      reset()
      onCreated()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : (message ?? "Não foi possível cadastrar o paciente."),
        )
      } else {
        setError("Não foi possível cadastrar o paciente.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="62999999999"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha de acesso</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">Nascimento</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Sexo</Label>
          <Select
            value={gender}
            onValueChange={(value) => setGender(value as typeof gender)}
          >
            <SelectTrigger id="gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Masculino</SelectItem>
              <SelectItem value="FEMALE">Feminino</SelectItem>
              <SelectItem value="OTHER">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor">Médico responsável (opcional)</Label>
        <Select value={doctorId || "none"} onValueChange={(value) => setDoctorId(value === "none" ? "" : value)}>
          <SelectTrigger id="doctor">
            <SelectValue placeholder="Sem vínculo agora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem vínculo agora</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {`${doctor.user?.firstName ?? ""} ${doctor.user?.lastName ?? ""}`.trim() ||
                  "Médico"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <Button type="submit" disabled={submitting || !activeUnitId}>
        {submitting ? "Cadastrando..." : "Cadastrar paciente"}
      </Button>
    </form>
  )
}
