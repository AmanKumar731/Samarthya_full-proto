from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Union, Dict, Any, Optional
import json
import os
from datetime import date

app = FastAPI(
    title="Samarthya Welfare & Credit Scheme Matching API",
    description="Backend API for matching special-needs student profiles and SC entrepreneurs with eligible government welfare schemes & NSFDC concessional loans.",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load schemes database from JSON
SCHEMES_FILE = os.path.join(os.path.dirname(__file__), "schemes.json")
try:
    with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
        schemes_data = json.load(f)
except Exception as e:
    schemes_data = {
        "INDIAN_STATES": [],
        "EDUCATION_LEVELS": [],
        "DISABILITY_TYPES": [],
        "SCHEME_CATEGORIES": {},
        "SCHEME_DATABASE": [],
        "CREDIT_SCHEME_DATABASE": [],
        "CHANNEL_PARTNERS_DATABASE": []
    }
    print(f"Warning: Failed to load schemes database: {e}")

# Pydantic models for request validation
class StudentProfile(BaseModel):
    name: str = "Student"
    dob: str  # YYYY-MM-DD
    gender: str  # male, female, other
    state: str
    disabilityTypes: List[str]
    disabilityPercent: int = Field(ge=0, le=100)
    educationLevel: str
    householdIncome: int

class CreditApplicantProfile(BaseModel):
    name: str = "Applicant"
    state: str = "maharashtra"
    gender: str = "male"
    householdIncome: int = 180000
    hasScCert: bool = True
    scCertNumber: str = ""
    purpose: str = "business"  # business, education
    sector: str = "service"
    courseType: str = "inland"
    projectCost: int = 200000
    promoterContribution: int = 20000
    hasProjectReport: bool = False
    trainingCompleted: bool = False

# Matching Engine helpers
def calculate_age(dob_str: str) -> int:
    try:
        dob = date.fromisoformat(dob_str)
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    except Exception:
        # Fallback if invalid date
        return 18

def get_disability_label(dtype_id: str) -> str:
    for d in schemes_data.get("DISABILITY_TYPES", []):
        if d["id"] == dtype_id:
            return d["label"]
    return dtype_id

def get_education_label(edu_id: str) -> str:
    for e in schemes_data.get("EDUCATION_LEVELS", []):
        if e["id"] == edu_id:
            return e["label"]
    return edu_id

def days_to_deadline(deadline_str: str) -> int:
    try:
        deadline = date.fromisoformat(deadline_str)
        today = date.today()
        diff = deadline - today
        return diff.days
    except Exception:
        return 365

def evaluate_scheme(profile: StudentProfile, age: int, scheme: Dict[str, Any]) -> Dict[str, Any]:
    e = scheme.get("eligibility", {})
    checks = []
    total_weight = 0
    passed_weight = 0

    # 1. Disability Type Check (weight: 30)
    weight_dtype = 30
    total_weight += weight_dtype
    scheme_dtypes = e.get("disabilityTypes", [])
    profile_dtypes = profile.disabilityTypes
    has_no_disability = "none" in profile_dtypes
    
    passed_dtype = False
    detail_dtype = ""
    
    if has_no_disability:
        passed_dtype = e.get("disabilityPercentMin", 0) == 0
        detail_dtype = "No disability required for this scheme" if passed_dtype else "This scheme requires a disability certificate"
    else:
        intersection = [d for d in profile_dtypes if d in scheme_dtypes]
        passed_dtype = len(intersection) > 0
        if passed_dtype:
            detail_dtype = f"Matched: {', '.join([get_disability_label(d) for d in intersection])}"
        else:
            required_list = ', '.join([get_disability_label(d) for d in scheme_dtypes[:4]])
            detail_dtype = f"Your type(s) not covered. Scheme requires: {required_list}..."

    if passed_dtype:
        passed_weight += weight_dtype
    
    checks.append({
        "name": "Disability Type Match",
        "weight": weight_dtype,
        "passed": passed_dtype,
        "detail": detail_dtype
    })

    # 2. Disability Percentage Check (weight: 20)
    weight_percent = 20
    total_weight += weight_percent
    required_percent = e.get("disabilityPercentMin", 40)
    passed_percent = profile.disabilityPercent >= required_percent
    
    if passed_percent:
        passed_weight += weight_percent
        detail_percent = f"Your {profile.disabilityPercent}% >= required {required_percent}%"
    else:
        detail_percent = f"Your {profile.disabilityPercent}% < required minimum {required_percent}%"

    checks.append({
        "name": "Disability Percentage",
        "weight": weight_percent,
        "passed": passed_percent,
        "detail": detail_percent
    })

    # 3. Education Level Check (weight: 15)
    weight_edu = 15
    total_weight += weight_edu
    allowed_levels = e.get("educationLevels", "all")
    
    if allowed_levels == "all":
        passed_edu = True
    elif isinstance(allowed_levels, list):
        passed_edu = profile.educationLevel in allowed_levels
    else:
        passed_edu = False

    if passed_edu:
        passed_weight += weight_edu
        detail_edu = f"Current level '{get_education_label(profile.educationLevel)}' is eligible"
    else:
        req_levels = ', '.join([get_education_label(l) for l in allowed_levels[:3]]) if isinstance(allowed_levels, list) else "all"
        detail_edu = f"Level '{get_education_label(profile.educationLevel)}' not eligible. Requires: {req_levels}..."

    checks.append({
        "name": "Education Level",
        "weight": weight_edu,
        "passed": passed_edu,
        "detail": detail_edu
    })

    # 4. Income Ceiling Check (weight: 15)
    weight_income = 15
    total_weight += weight_income
    max_income = e.get("maxIncome", 9999999)
    passed_income = profile.householdIncome <= max_income

    if passed_income:
        passed_weight += weight_income
        income_str = "No limit" if max_income >= 9999999 else f"Rs {max_income/100000:.1f} lakh"
        detail_income = f"Income within limit (Max: {income_str})"
    else:
        income_str = f"Rs {max_income/100000:.1f} lakh"
        detail_income = f"Income Rs {profile.householdIncome/100000:.1f}L exceeds maximum {income_str}"

    checks.append({
        "name": "Income Eligibility",
        "weight": weight_income,
        "passed": passed_income,
        "detail": detail_income
    })

    # 5. Age Range Check (weight: 10)
    weight_age = 10
    total_weight += weight_age
    age_range = e.get("ageRange", [0, 99])
    min_age, max_age = age_range[0], age_range[1]
    passed_age = min_age <= age <= max_age

    if passed_age:
        passed_weight += weight_age
        detail_age = f"Age {age} is within {min_age}-{max_age} years"
    else:
        detail_age = f"Age {age} is outside required range ({min_age}-{max_age})"

    checks.append({
        "name": "Age Range",
        "weight": weight_age,
        "passed": passed_age,
        "detail": detail_age
    })

    # 6. Gender Check (weight: 5)
    weight_gender = 5
    total_weight += weight_gender
    req_gender = e.get("gender", "all")
    passed_gender = req_gender == "all" or req_gender == profile.gender

    if passed_gender:
        passed_weight += weight_gender
        detail_gender = "Gender criteria met"
    else:
        detail_gender = f"Scheme is for {req_gender} only"

    checks.append({
        "name": "Gender Eligibility",
        "weight": weight_gender,
        "passed": passed_gender,
        "detail": detail_gender
    })

    # 7. State Check (weight: 5)
    weight_state = 5
    total_weight += weight_state
    allowed_states = e.get("states", "all")
    
    if allowed_states == "all":
        passed_state = True
    elif isinstance(allowed_states, list):
        passed_state = profile.state in allowed_states
    else:
        passed_state = False

    if passed_state:
        passed_weight += weight_state
        detail_state = "Your state is covered"
    else:
        detail_state = "Scheme not available in your state"

    checks.append({
        "name": "State/UT Coverage",
        "weight": weight_state,
        "passed": passed_state,
        "detail": detail_state
    })

    # Compute final score
    score = round((passed_weight / total_weight) * 100)

    # Status classification
    if score >= 85:
        status = "highly-eligible"
    elif score >= 65:
        status = "likely-eligible"
    elif score >= 40:
        status = "partially-eligible"
    else:
        status = "low-match"

    days_left = days_to_deadline(scheme.get("deadline", "2027-12-31"))
    is_urgent = 0 < days_left <= 60

    return {
        "scheme": scheme,
        "score": score,
        "status": status,
        "checks": checks,
        "daysToDeadline": days_left,
        "isUrgent": is_urgent,
        "requiredDocuments": scheme.get("requiredDocuments", [])
    }

# API Endpoints
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Samarthya Scheme Matching API",
        "endpoints": {
            "GET /api/metadata": "Fetch Indian states, education levels, disability types, and categories.",
            "GET /api/schemes": "Fetch all welfare schemes in the database.",
            "POST /api/match": "Evaluate student profile against schemes database to find matches."
        }
    }

@app.get("/api/metadata")
def get_metadata():
    return {
        "states": schemes_data.get("INDIAN_STATES", []),
        "educationLevels": schemes_data.get("EDUCATION_LEVELS", []),
        "disabilityTypes": schemes_data.get("DISABILITY_TYPES", []),
        "categories": schemes_data.get("SCHEME_CATEGORIES", {})
    }

@app.get("/api/schemes")
def get_schemes():
    return schemes_data.get("SCHEME_DATABASE", [])

@app.post("/api/match")
def match_profile(profile: StudentProfile):
    age = calculate_age(profile.dob)
    results = []
    
    for scheme in schemes_data.get("SCHEME_DATABASE", []):
        res = evaluate_scheme(profile, age, scheme)
        # Only return matches with score > 0
        if res["score"] > 0:
            results.append(res)
            
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    
    # Calculate stats summary
    highly_eligible = sum(1 for r in results if r["status"] == "highly-eligible")
    urgent = sum(1 for r in results if r["isUrgent"])
    avg_score = sum(r["score"] for r in results) / len(results) if results else 0.0
    
    categories = {}
    for r in results:
        cat = r["scheme"]["category"]
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "profile": {**profile.model_dump(), "age": age},
        "results": results,
        "stats": {
            "total": len(results),
            "highlyEligible": highly_eligible,
            "urgent": urgent,
            "avgScore": f"{avg_score:.1f}",
            "categories": categories
        }
    }

# ==================== NSFDC Credit Matching Functions ====================
def evaluate_credit_scheme(profile: CreditApplicantProfile, scheme: Dict[str, Any]) -> Dict[str, Any]:
    checks = []
    total_weight = 0
    passed_weight = 0
    matched_reasons = []
    missing_reasons = []

    is_sc = profile.hasScCert
    income = profile.householdIncome
    cost = profile.projectCost
    purpose = profile.purpose
    is_education = purpose == "education"

    # 1. SC Check (Weight: 30)
    w_sc = 30
    total_weight += w_sc
    if is_sc:
        passed_weight += w_sc
        checks.append({"id": "sc_category", "label": "SC Category Verification", "passed": True, "detail": "Valid SC Caste Certificate self-declared."})
        matched_reasons.append("SC Community Entitlement verified")
    else:
        checks.append({"id": "sc_category", "label": "SC Category Verification", "passed": False, "detail": "NSFDC mandates Scheduled Caste (SC) category."})
        missing_reasons.append("Requires valid SC certificate")

    # 2. Income Check (Weight: 30) - Statutory ceiling of Rs 5.0 Lakhs
    w_inc = 30
    total_weight += w_inc
    if income <= 500000:
        passed_weight += w_inc
        checks.append({"id": "income_limit", "label": "Household Income <= Rs 5.0L", "passed": True, "detail": f"Annual income Rs {income:,} is within Rs 5.0L ceiling."})
        matched_reasons.append(f"Income Rs {income:,} complies with NSFDC norms")
    else:
        checks.append({"id": "income_limit", "label": "Household Income <= Rs 5.0L", "passed": False, "detail": f"Income Rs {income:,} exceeds statutory Rs 5.0L ceiling."})
        missing_reasons.append("Annual income exceeds Rs 5.0 Lakh limit")

    # 3. Purpose & Cost Check (Weight: 25)
    w_cost = 25
    total_weight += w_cost
    scheme_id = scheme.get("id", "")
    max_amount = scheme.get("maxAmount", 5000000)

    if is_education:
        if scheme_id == "nsfdc_education_loan":
            passed_weight += w_cost
            checks.append({"id": "purpose_cost", "label": "Education Course Loan Fit", "passed": True, "detail": "Optimal for higher professional education."})
            matched_reasons.append("Concessional student loan rate (6.5%)")
        else:
            checks.append({"id": "purpose_cost", "label": "Enterprise Purpose Mismatch", "passed": False, "detail": "Scheme is designed for business, not tuition."})
    else:
        if scheme_id == "nsfdc_education_loan":
            checks.append({"id": "purpose_cost", "label": "Purpose Mismatch", "passed": False, "detail": "Education scheme not applicable for commercial enterprise."})
        elif cost <= max_amount:
            passed_weight += w_cost
            checks.append({"id": "purpose_cost", "label": f"Project Cost <= Rs {max_amount/100000:.1f}L", "passed": True, "detail": f"Project cost Rs {cost:,} is within scheme ceiling."})
            matched_reasons.append(f"Within scheme financial cap of Rs {max_amount/100000:.1f} Lakh")
        else:
            partial = round(w_cost * 0.4)
            passed_weight += partial
            checks.append({"id": "purpose_cost", "label": "Project Cost Exceeds Cap", "passed": False, "detail": f"Cost Rs {cost:,} exceeds scheme cap Rs {max_amount:,}."})
            missing_reasons.append(f"Cost exceeds maximum scheme limit of Rs {max_amount:,}")

    # 4. Sector Check (Weight: 10)
    w_sec = 10
    total_weight += w_sec
    if not is_education:
        passed_weight += w_sec
        checks.append({"id": "sector_fit", "label": "Commercial Sector Viability", "passed": True, "detail": f"Sector '{profile.sector}' is an eligible commercial activity."})
        matched_reasons.append(f"Recognized commercial sector: {profile.sector}")
    else:
        passed_weight += w_sec
        checks.append({"id": "course_fit", "label": "Accredited Higher Study", "passed": True, "detail": f"Course track '{profile.courseType}' is eligible."})

    # 5. Channel Partner Availability (Weight: 5)
    w_part = 5
    total_weight += w_part
    state_norm = profile.state.lower().replace(" ", "_")
    partners = schemes_data.get("CHANNEL_PARTNERS_DATABASE", [])
    has_active_partner = any(p.get("state", "").lower().replace(" ", "_") == state_norm and p.get("fundHealthStatus") == "healthy" for p in partners)
    if has_active_partner:
        passed_weight += w_part
        checks.append({"id": "partner_avail", "label": "Channel Partner Active", "passed": True, "detail": f"Active channel partner branch available in {profile.state}."})
        matched_reasons.append(f"Active SCA / PSB partner operating in {profile.state}")
    else:
        passed_weight += round(w_part * 0.5)
        checks.append({"id": "partner_avail", "label": "Channel Partner Network", "passed": True, "detail": "Lead Public Sector Bank channel available."})

    score = round((passed_weight / total_weight) * 100) if total_weight > 0 else 0
    is_eligible = is_sc and (income <= 500000)

    if not is_eligible:
        status = "ineligible"
    elif score >= 85:
        status = "highly-eligible"
    elif score >= 65:
        status = "likely-eligible"
    else:
        status = "partially-eligible"

    return {
        "scheme": scheme,
        "score": score,
        "status": status,
        "isEligible": is_eligible,
        "checks": checks,
        "matchedReasons": matched_reasons,
        "missingReasons": missing_reasons,
        "indicativeRate": scheme.get("interestRates", {}).get("beneficiaryFinalMin", 6.5)
    }

@app.get("/api/credit-schemes")
def get_credit_schemes():
    return schemes_data.get("CREDIT_SCHEME_DATABASE", [])

@app.get("/api/channel-partners")
def get_channel_partners(state: Optional[str] = Query(None), healthy_only: bool = Query(False)):
    partners = schemes_data.get("CHANNEL_PARTNERS_DATABASE", [])
    if state:
        st_clean = state.lower().replace(" ", "_")
        partners = [p for p in partners if p.get("state", "").lower().replace(" ", "_") == st_clean]
    if healthy_only:
        partners = [p for p in partners if p.get("fundHealthStatus") == "healthy"]
    return partners

@app.post("/api/match-credit")
def match_credit_profile(profile: CreditApplicantProfile):
    schemes = schemes_data.get("CREDIT_SCHEME_DATABASE", [])
    results = []
    for s in schemes:
        res = evaluate_credit_scheme(profile, s)
        results.append(res)
    results.sort(key=lambda x: x["score"], reverse=True)
    return {
        "profile": profile.model_dump(),
        "results": results,
        "eligibleCount": sum(1 for r in results if r["isEligible"]),
        "bestMatch": results[0] if results else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
