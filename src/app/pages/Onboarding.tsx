import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { getDashboardRoute } from '../mockData';

type Country = { name: string; code: string; dial: string };

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [lecturerIntent, setLecturerIntent] = useState<'STUDENT' | 'LECTURER_APPLICANT'>('STUDENT');
  const [loading, setLoading] = useState(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [kycFiles, setKycFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const loadCountries = async () => {
      setCountriesError(null);
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
        if (!res.ok) throw new Error('countries v3.1 failed');
        const data = await res.json();
        let mapped: Country[] = data
          .filter((c: any) => c.name?.common && c.cca2 && c.idd?.root && c.idd?.suffixes?.length)
          .map((c: any) => ({
            name: c.name.common,
            code: c.cca2,
            dial: `${c.idd.root}${c.idd.suffixes[0]}`,
          }));
        if (!mapped.length) throw new Error('empty map');
        mapped = mapped.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(mapped);
        return;
      } catch {}
      try {
        const res2 = await fetch('https://restcountries.com/v2/all?fields=name,alpha2Code,callingCodes');
        if (!res2.ok) throw new Error('countries v2 failed');
        const data2 = await res2.json();
        let mapped2: Country[] = data2
          .filter((c: any) => c.name && c.alpha2Code && Array.isArray(c.callingCodes) && c.callingCodes[0])
          .map((c: any) => ({
            name: c.name,
            code: c.alpha2Code,
            dial: `+${c.callingCodes[0]}`,
          }));
        mapped2 = mapped2.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(mapped2);
        return;
      } catch (e: any) {
        setCountriesError('Unable to load countries. Check your connection and try again.');
        setCountries([]);
      }
    };
    (async () => {
      await loadCountries();
      try {
        const snap = await getDoc(doc(db, 'users', user.id));
        if (snap.exists()) {
          const d = snap.data() as any;
          setFullName(d.name || user.name || '');
          if (d.countryCode && d.countryName && d.phoneCode) {
            setCountry({ name: d.countryName, code: d.countryCode, dial: d.phoneCode });
          }
          setPhone(d.phoneRaw || '');
          setGender(d.gender || '');
          setLecturerIntent(d.lecturerApplicant ? 'LECTURER_APPLICANT' : 'STUDENT');
          setBio(d.bio || '');
          setCurrentAvatar(d.avatarUrl || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!country) {
      toast.error('Select a country');
      return;
    }
    const phoneE164 = `${country.dial}${phone.replace(/\D/g, '')}`;
    try {
      let avatarUrl: string | undefined = undefined;
      if (avatarFile) {
        const fileRef = storageRef(storage, `avatars/${user.id}.jpg`);
        await uploadBytes(fileRef, avatarFile);
        avatarUrl = await getDownloadURL(fileRef);
      }
      const uploadedKyc: string[] = [];
      const kycInput = (document.getElementById('kyc-input') as HTMLInputElement | null);
      if (kycInput?.files && kycInput.files.length) {
        for (const f of Array.from(kycInput.files)) {
          const kref = storageRef(storage, `kyc/${user.id}/${Date.now()}-${f.name}`);
          await uploadBytes(kref, f);
          uploadedKyc.push(await getDownloadURL(kref));
        }
      }
      await setDoc(doc(db, 'users', user.id), {
        name: fullName,
        email: user.email,
        role: 'STUDENT',
        countryCode: country.code,
        countryName: country.name,
        phoneCode: country.dial,
        phoneE164,
        phoneRaw: phone,
        gender,
        bio,
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(uploadedKyc.length ? { kycFiles: uploadedKyc, kycStatus: 'PENDING' } : {}),
        lecturerApplicant: lecturerIntent === 'LECTURER_APPLICANT',
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success('Profile saved');
      navigate(getDashboardRoute('STUDENT'));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: '#ffffff' }}>
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle style={{ color: '#0066FF' }}>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-white/50 bg-white/60 backdrop-blur">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" />
                ) : currentAvatar ? (
                  <img src={currentAvatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No photo</div>
                )}
              </div>
              <div className="w-full sm:w-auto">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur cursor-pointer w-full sm:w-auto justify-center">
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAvatarFile(f);
                      setAvatarPreview(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                </label>
                <div className="text-xs text-gray-500 mt-1">JPG/PNG, square works best</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <textarea
                className="w-full min-h-24 rounded-lg border border-white/50 bg-white/60 backdrop-blur px-3 py-2 text-sm"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Lecturer Verification (Optional)</Label>
              <p className="text-xs text-gray-600">If you plan to teach, upload ID/certificates for admin verification.</p>
              <input id="kyc-input" type="file" multiple />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <select
                  className="w-full border rounded px-2 py-2 bg-white/60 backdrop-blur border-white/50 rounded-lg"
                  value={country?.code || ''}
                  onChange={(e) => {
                    const c = countries.find((x) => x.code === e.target.value) || null;
                    setCountry(c);
                  }}
                  required
                >
                  <option value="">{countries.length ? 'Select country' : (countriesError || 'Loading countries…')}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>
                  ))}
                </select>
                {countriesError && (
                  <button
                    type="button"
                    className="text-xs underline text-blue-700 mt-1"
                    onClick={async () => {
                      // retry load
                      try {
                        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
                        const data = await res.json();
                        const mapped: Country[] = data
                          .filter((c: any) => c.name?.common && c.cca2 && c.idd?.root && c.idd?.suffixes?.length)
                          .map((c: any) => ({
                            name: c.name.common,
                            code: c.cca2,
                            dial: `${c.idd.root}${c.idd.suffixes[0]}`,
                          }))
                          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
                        setCountries(mapped);
                        setCountriesError(null);
                      } catch {
                        // no-op
                      }
                    }}
                  >
                    Retry loading countries
                  </button>
                )}
                <div className="space-y-2">
                  <Label>Code</Label>
                  <select
                    className="w-full border rounded px-2 py-2 bg-white/60 backdrop-blur border-white/50 rounded-lg"
                    value={country?.dial || ''}
                    onChange={(e) => {
                      const c = countries.find((x) => x.dial === e.target.value) || null;
                      setCountry(c);
                    }}
                  >
                    <option value="">{countries.length ? 'Select code' : '—'}</option>
                    {countries.map((c) => (
                      <option key={`${c.code}-${c.dial}`} value={c.dial}>{c.dial} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border rounded-l bg-gray-50 text-sm text-gray-600 overflow-hidden">
                    {country?.dial || '+..'}
                  </span>
                  <Input className="rounded-l-none" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="123456789" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup value={gender} onValueChange={(v) => setGender(v as any)}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="male" value="MALE" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="female" value="FEMALE" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Register As</Label>
              <RadioGroup value={lecturerIntent} onValueChange={(v) => setLecturerIntent(v as any)}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="student" value="STUDENT" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="lecturerApplicant" value="LECTURER_APPLICANT" />
                    <Label htmlFor="lecturerApplicant">I am a Lecturer (contact me)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#0066FF' }}>
              Save and Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
