import os
import datetime
import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError
from PIL import Image
import imagehash
import base64
from io import BytesIO
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("qrtixpro-backend")

load_dotenv()

MONGO_URI: Optional[str] = os.environ.get("MONGO_URI")
DB_NAME: str = os.environ.get("DB_NAME", "qrtixpro")
COLLECTION_NAME: str = os.environ.get("COLLECTION_NAME", "usuarios")
RESERVATIONS_COLLECTION: str = os.environ.get("RESERVATIONS_COLLECTION", "seat_reservations")
SALES_COLLECTION: str = os.environ.get("SALES_COLLECTION", "ventas")
RESERVATION_MINUTES: int = int(os.environ.get("RESERVATION_MINUTES", "15"))

client: Optional[MongoClient] = None
if MONGO_URI:
    try:
        print("[MongoDB] Creando cliente MongoDB...")
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        print("[MongoDB] Cliente creado correctamente. Esperando startup para probar conexión...")
    except Exception as e:
        print(f"[MongoDB] ERROR al crear cliente: {e}")
        client = None
else:
    print("[MongoDB] ADVERTENCIA: MONGO_URI no está configurado en el archivo .env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    if client is None:
        logger.warning("❌ No hay cliente MongoDB configurado. Las funciones que requieran BD fallarán.")
    else:
        try:
            client.admin.command("ping")
            db_names = client.list_database_names()
            logger.info("✅ Conexión a MongoDB Atlas EXITOSA")
            logger.info(f"   - Base de datos objetivo: {DB_NAME}")
            logger.info(f"   - Colección objetivo: {COLLECTION_NAME}")
            logger.info(f"   - Bases disponibles: {', '.join(db_names) if db_names else '(ninguna visible)'}")
            db = client[DB_NAME]
            if DB_NAME in db_names:
                colls = db.list_collection_names()
                logger.info(f"   - Colecciones en '{DB_NAME}': {', '.join(colls) if colls else '(vacía)'}")
            else:
                logger.warning(f"   ⚠️  La base '{DB_NAME}' no existe aún. Se creará al insertar el primer documento.")
            
            # ============== TTL INDEX: seat_reservations → Mongo BORRA SOLO las reservas expiradas (status=reserved)
            reservations_coll = db[RESERVATIONS_COLLECTION]
            indexes = [idx['name'] for idx in reservations_coll.list_indexes()]
            ttl_index_name = "expires_at_reserved_ttl"
            if ttl_index_name not in indexes:
                try:
                    from pymongo import ASCENDING
                    reservations_coll.create_index(
                        [("expires_at", ASCENDING)],
                        name=ttl_index_name,
                        expireAfterSeconds=0,
                        partialFilterExpression={"status": "reserved"},
                        background=True
                    )
                    logger.info(f"⏱️  TTL Index creado OK en '{RESERVATIONS_COLLECTION}' ({RESERVATION_MINUTES}min para status=reserved)")
                except Exception as idx_err:
                    logger.warning(f"⚠️  No se pudo crear TTL index (puede que ya exista): {idx_err}")
            else:
                logger.info(f"⏱️  TTL Index OK en '{RESERVATIONS_COLLECTION}'")
            
            # Index compuesto para búsquedas rápidas por evento
            try:
                reservations_coll.create_index(
                    [("event_id", ASCENDING), ("status", ASCENDING)],
                    name="event_id_status_idx",
                    background=True
                )
            except Exception:
                pass
        except (ConnectionFailure, ConfigurationError) as e:
            logger.error(f"❌ FALLO al conectar con MongoDB Atlas: {e}")
            client = None
        except Exception as e:
            logger.error(f"❌ Error inesperado al conectar MongoDB: {e}")
            client = None

    yield

    if client is not None:
        client.close()
        logger.info("🔌 Conexión MongoDB cerrada correctamente")


app = FastAPI(lifespan=lifespan)


cors_origins_env = os.environ.get("CORS_ORIGINS")
origins = [o.strip() for o in cors_origins_env.split(",")] if cors_origins_env else [os.environ.get("CORS_ORIGIN", "http://localhost:3000")]
cors_origin_regex = os.environ.get("CORS_ORIGIN_REGEX", ".*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignupPayload(BaseModel):
    name: Optional[str] = None
    lastname: Optional[str] = None
    cedula: Optional[str] = None
    telefono: Optional[str] = None
    email: EmailStr
    password: str
    photo: Optional[str] = None  
    tos: Optional[bool] = False


class LoginPayload(BaseModel):
    email: EmailStr
    password: str
    photo: str  


# Event models
class Event(BaseModel):
    id: str
    name: str
    date: str
    venue: str
    image: str
    description: str
    priceFrom: str
    tickets: List[Dict[str, Any]]
    venueDetails: Dict[str, Any]


# Event data (in a real app, this would come from a database)
EVENTS_DATA = [
    {
        "id": "llaneros-2025",
        "name": "LLaneros 2025_2",
        "date": "Sábado, 15 de Febrero, 2025 20:00",
        "venue": "Estadio Bello Horizonte",
        "image": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "El Club Llaneros es una institución deportiva colombiana con sede en Villavicencio, Meta, que compite en la Primera B del fútbol profesional colombiano. Fundado en 1996, el club ha sido un referente del fútbol llanero y ha logrado consolidarse como uno de los equipos más importantes de la región oriental del país. Su estadio, el Bello Horizonte, es conocido por su ambiente festivo y el apoyo incondicional de su hinchada, que convierte cada partido en una verdadera fiesta del fútbol. El equipo se caracteriza por su juego dinámico y ofensivo, reflejando el espíritu alegre y combativo de los llanos orientales.",
        "priceFrom": "25",
        "tickets": [
            {"type": "General", "price": "25.000", "available": True},
            {"type": "Preferencial", "price": "45.000", "available": True},
            {"type": "VIP", "price": "80.000", "available": False}
        ],
        "venueDetails": {
            "name": "Estadio Bello Horizonte",
            "email": "info@bellohorizonte.com",
            "mapUrl": "https://maps.google.com/?q=Estadio+Bello+Horizonte+Villavicencio"
        }
    },
    {
        "id": "fucks-news",
        "name": "FUCKS NEWS NOTICREO",
        "date": "Viernes, 28 de Marzo, 2025 21:30",
        "venue": "Teatro Nacional",
        "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "Una experiencia única de entretenimiento que combina humor, crítica social y análisis de la actualidad nacional e internacional. Este espectáculo presenta una perspectiva irreverente y divertida sobre los acontecimientos más relevantes del momento, utilizando la sátira y el humor inteligente para abordar temas de política, sociedad y cultura popular. Con un formato dinámico que incluye sketches, monólogos y interacción con el público, promete una noche llena de risas y reflexión.",
        "priceFrom": "35",
        "tickets": [
            {"type": "Platea", "price": "35.000", "available": True},
            {"type": "Palco", "price": "55.000", "available": True},
            {"type": "Premium", "price": "75.000", "available": True}
        ],
        "venueDetails": {
            "name": "Teatro Nacional",
            "email": "contacto@teatronacional.gov.co",
            "mapUrl": "https://maps.google.com/?q=Teatro+Nacional+Bogotá"
        }
    },
    {
        "id": "festival-infantil",
        "name": "Festival Infantil Mágico",
        "date": "Domingo, 12 de Abril, 2025 15:00",
        "venue": "Parque Simón Bolívar",
        "image": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "Un evento familiar diseñado especialmente para los más pequeños de la casa. El Festival Infantil Mágico ofrece una jornada completa de diversión con espectáculos de magia, obras de teatro infantil, talleres creativos, juegos interactivos y actividades educativas. Los niños podrán disfrutar de personajes fantásticos, aprender nuevas habilidades y participar en aventuras emocionantes en un ambiente seguro y lleno de color. Incluye zona de comidas saludables y espacios de descanso para toda la familia.",
        "priceFrom": "15",
        "tickets": [
            {"type": "Niño", "price": "15.000", "available": True},
            {"type": "Adulto", "price": "20.000", "available": True},
            {"type": "Familiar (2+2)", "price": "60.000", "available": True}
        ],
        "venueDetails": {
            "name": "Parque Simón Bolívar",
            "email": "eventos@parquesimonbolivar.gov.co",
            "mapUrl": "https://maps.google.com/?q=Parque+Simón+Bolívar+Bogotá"
        }
    }
]


def data_url_to_image(data_url: str) -> Image.Image:
    if not data_url or "," not in data_url:
        raise ValueError("Invalid data URL")
    header, b64 = data_url.split(",", 1)
    if "base64" not in header:
        raise ValueError("Data URL not base64")
    raw = base64.b64decode(b64)
    img = Image.open(BytesIO(raw))
    return img.convert("RGB")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/v1/signin/password")
async def signup(request: Request, payload: Optional[SignupPayload] = Body(None)):
    if client is None:
        raise HTTPException(status_code=500, detail="Config error: MONGO_URI not set or invalid")

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    data = None
    if payload is not None:
        data = payload.dict()
    else:
        try:
            data = await request.json()
        except Exception:
            try:
                form = await request.form()
                data = dict(form)
            except Exception:
                raise HTTPException(status_code=400, detail="Cuerpo de solicitud vacío o no soportado")

    def _to_bool(v):
        if isinstance(v, bool):
            return v
        if v is None:
            return False
        return str(v).strip().lower() in ("1", "true", "yes", "on", "y", "t")

    payload_obj = SignupPayload(
        name=data.get("name"),
        lastname=data.get("lastname"),
        cedula=data.get("cedula"),
        telefono=data.get("telefono"),
        email=data.get("email"),
        password=data.get("password"),
        photo=data.get("photo"),
        tos=_to_bool(data.get("tos")),
    )

    doc = {
        "name": payload_obj.name or "",
        "lastname": payload_obj.lastname or "",
        "cedula": payload_obj.cedula or "",
        "telefono": payload_obj.telefono or "",
        "email": payload_obj.email,
        "password": payload_obj.password,  
        "photo": payload_obj.photo or None,        
        "tos": bool(payload_obj.tos),
        "createdAt": datetime.datetime.utcnow(),
    }

    try:
        result = collection.insert_one(doc)
        return {"title": "OK", "results": {"insertedId": str(result.inserted_id)}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert error: {str(e)}")


@app.post("/v1/signin/login")
async def login(payload: LoginPayload):
    if client is None:
        raise HTTPException(status_code=500, detail="Config error: MONGO_URI not set or invalid")

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    user = collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if user.get("password") != payload.password:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    stored_photo = user.get("photo")
    if not stored_photo:
        raise HTTPException(status_code=400, detail="No hay foto registrada para el usuario")

    similarity = None
    used_model = None
    try:
        img1 = data_url_to_image(stored_photo)
        img2 = data_url_to_image(payload.photo)

        try:
            from deepface import DeepFace
            models = ["ArcFace", "SFace", "Facenet512"]
            for model_name in models:
                try:
                    res = DeepFace.verify(
                        img1_path=pil_to_cv(img1),
                        img2_path=pil_to_cv(img2),
                        model_name=model_name,
                        distance_metric="cosine",
                        detector_backend="opencv",
                        enforce_detection=True,
                    )
                    distance = float(res.get("distance", 1.0))
                    similarity = max(0.0, min(1.0, 1.0 - distance))
                    used_model = model_name
                    break
                except Exception:
                    continue

            if used_model is None:
                raise ImportError("DeepFace models unavailable")

            if similarity < 0.50:
                raise HTTPException(status_code=401, detail=f"La foto no coincide (similaridad: {round(similarity*100)}%) [{used_model}]")
        except ImportError:
            if not detect_face(img1) or not detect_face(img2):
                raise HTTPException(status_code=400, detail="No se detectó rostro en la foto enviada")
            similarity = combined_hash_similarity(img1, img2)
            if similarity < 0.50:
                raise HTTPException(status_code=401, detail=f"La foto no coincide (similaridad: {round(similarity*100)}%)")
        except Exception:
            if not detect_face(img1) or not detect_face(img2):
                raise HTTPException(status_code=400, detail="No se detectó rostro en la foto enviada")
            similarity = combined_hash_similarity(img1, img2)
            if similarity < 0.50:
                raise HTTPException(status_code=401, detail=f"La foto no coincide (similaridad: {round(similarity*100)}%) ")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando foto: {str(e)}")

    results = {
        "userId": str(user.get("_id")),
        "name": user.get("name", "Usuario"),
        "lastname": user.get("lastname", ""),
        "email": user.get("email", ""),
        "cedula": user.get("cedula", ""),
        "telefono": user.get("telefono", "")
    }
    if similarity is not None:
        results["similarity"] = round(similarity * 100, 2)
        if used_model:
            results["model"] = used_model

    return {"title": "Login exitoso", "results": results}


# Event endpoints
@app.get("/v1/events")
async def get_all_events():
    """Get all events"""
    return {"title": "OK", "results": EVENTS_DATA}


@app.get("/v1/events/{event_id}")
async def get_event_by_id(event_id: str):
    """Get a specific event by ID"""
    event = next((e for e in EVENTS_DATA if e["id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return {"title": "OK", "results": event}


# ===========================================================
# 🎟️ SEAT RESERVATIONS SYSTEM (Reserva temporal 15 min TTL)
# ===========================================================
import uuid
from bson.objectid import ObjectId
from datetime import timedelta

class SeatRef(BaseModel):
    zone: str
    row: int
    seat: int
    price: Optional[float] = None

class ReservePayload(BaseModel):
    event_id: str
    seats: List[SeatRef]
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class ConfirmPayload(BaseModel):
    reservation_id: str
    session_id: Optional[str] = None
    purchase_id: Optional[str] = None

class ReleasePayload(BaseModel):
    reservation_id: str
    session_id: Optional[str] = None

def _seat_key(s) -> str:
    return f"{s.get('zone',s['zone']).strip().lower()}|{int(s.get('row',s['row']))}|{int(s.get('seat',s['seat']))}"

def _ensure_mongo():
    if client is None:
        raise HTTPException(status_code=500, detail="Config error: MONGO_URI not set or invalid")
    return client[DB_NAME]


@app.get("/api/seats/status/{event_id}")
async def get_seats_status(event_id: str, session_id: Optional[str] = None):
    """Retorna asientos ocupados (reservados x otros + vendidos), mis reservas, stats."""
    db = _ensure_mongo()
    reservations_coll = db[RESERVATIONS_COLLECTION]
    now = datetime.datetime.utcnow()

    all_active = list(reservations_coll.find({
        "event_id": event_id,
        "status": {"$in": ["reserved", "sold"]},
        "$or": [
            {"status": "sold"},
            {"status": "reserved", "$or": [{"expires_at": None}, {"expires_at": {"$gt": now}}]},
        ],
    }))

    occupied: List[Dict[str, Any]] = []
    my_reservations: List[Dict[str, Any]] = []
    sold_count = 0
    reserved_others_count = 0

    for r in all_active:
        seats_data = [dict(zone=s["zone"], row=int(s["row"]), seat=int(s["seat"])) for s in r.get("seats", [])]
        entry = {
            "id": str(r["_id"]),
            "status": r["status"],
            "seats": seats_data,
            "reserved_at": r.get("reserved_at").isoformat() if r.get("reserved_at") else None,
            "expires_at": r.get("expires_at").isoformat() if r.get("expires_at") else None,
        }
        is_mine = bool(session_id) and session_id == r.get("session_id") and r["status"] == "reserved"
        if is_mine:
            my_reservations.append(entry)
        else:
            occupied.extend(seats_data)
        if r["status"] == "sold":
            sold_count += len(seats_data)
        elif r["status"] == "reserved" and not is_mine:
            reserved_others_count += len(seats_data)

    return {
        "title": "OK",
        "results": {
            "event_id": event_id,
            "occupied": occupied,
            "my_reservations": my_reservations,
            "stats": {
                "sold_count": sold_count,
                "reserved_others_count": reserved_others_count,
            },
        },
    }


@app.post("/api/seats/reserve")
async def reserve_seats(payload: ReservePayload):
    """
    RESERVA asientos por 15 min (RESERVATION_MINUTES).
    - Si YA están ocupados por otro usuario (sold o reserved <> self.session): HTTP 409 CONFLICT + cuáles
    - Si es TU MISMA reserva (mismo session_id): la actualiza por los nuevos asientos
    - Retorna reservation_id, expires_at, seconds_left
    """
    db = _ensure_mongo()
    reservations_coll = db[RESERVATIONS_COLLECTION]
    now = datetime.datetime.utcnow()

    if not payload.event_id or not payload.seats:
        raise HTTPException(status_code=400, detail="event_id y seats son requeridos")

    session_id = payload.session_id or ("sess_" + uuid.uuid4().hex[:24])
    seats_clean: List[Dict[str, Any]] = [
        {"zone": s.zone.strip().lower(), "row": int(s.row), "seat": int(s.seat),
         **({"price": float(s.price)} if s.price is not None else {})}
        for s in payload.seats
    ]
    new_keys = {_seat_key(s) for s in seats_clean}

    # 1) Verificar conflictos: asientos vendidos PERMANENTES o reservados por OTROS
    active_same_event = list(reservations_coll.find({
        "event_id": payload.event_id,
        "status": {"$in": ["reserved", "sold"]},
        "$or": [
            {"status": "sold"},
            {"status": "reserved", "$or": [{"expires_at": None}, {"expires_at": {"$gt": now}}]},
        ],
    }))

    conflict_keys: set = set()
    self_reservation_ids_to_cancel = []
    for r in active_same_event:
        r_is_mine = r["status"] == "reserved" and r.get("session_id") == session_id
        for s in r.get("seats", []):
            k = _seat_key(s)
            if k not in new_keys:
                continue
            if r["status"] == "sold":
                conflict_keys.add(k)
            else:  # reserved
                if r_is_mine:
                    self_reservation_ids_to_cancel.append(r["_id"])
                else:
                    conflict_keys.add(k)

    if conflict_keys:
        occupied_detail = []
        for s in seats_clean:
            if _seat_key(s) in conflict_keys:
                occupied_detail.append({"zone": s["zone"], "row": s["row"], "seat": s["seat"]})
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Algunos asientos ya fueron ocupados",
                "occupied_seats": occupied_detail,
            },
        )

    # 2) Cancelar mis reservas previas del mismo evento (actualizar selección)
    if self_reservation_ids_to_cancel:
        reservations_coll.delete_many({"_id": {"$in": self_reservation_ids_to_cancel}})

    # 3) Insertar la NUEVA reserva
    expires = now + timedelta(minutes=RESERVATION_MINUTES)
    reservation_doc = {
        "event_id": payload.event_id,
        "seats": seats_clean,
        "session_id": session_id,
        "user_id": payload.user_id,
        "status": "reserved",
        "reserved_at": now,
        "expires_at": expires,
        "confirmed_at": None,
        "purchase_id": None,
    }
    res = reservations_coll.insert_one(reservation_doc)
    seconds_left = max(0, int((expires - now).total_seconds()))

    return {
        "title": "Reserva exitosa",
        "results": {
            "reservation_id": str(res.inserted_id),
            "session_id": session_id,
            "expires_at": expires.isoformat(),
            "seconds_left": seconds_left,
            "reservation_minutes": RESERVATION_MINUTES,
            "seats_count": len(seats_clean),
        },
    }


@app.post("/api/seats/confirm")
async def confirm_reservation(payload: ConfirmPayload):
    """Confirma una reserva → pasa a status 'sold' PERMANENTE. (No expira más)"""
    db = _ensure_mongo()
    reservations_coll = db[RESERVATIONS_COLLECTION]
    now = datetime.datetime.utcnow()

    try:
        rid = ObjectId(payload.reservation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="reservation_id inválido")

    query = {"_id": rid, "status": "reserved"}
    if payload.session_id:
        query["session_id"] = payload.session_id

    r = reservations_coll.find_one(query)
    if not r:
        sold = reservations_coll.find_one({"_id": rid, "status": "sold"})
        if sold:
            return {"title": "OK", "results": {"reservation_id": payload.reservation_id, "status": "sold", "already_confirmed": True}}
        raise HTTPException(status_code=404, detail="Reserva no encontrada, inválida o expirada")

    reservations_coll.update_one(
        {"_id": rid},
        {"$set": {
            "status": "sold",
            "confirmed_at": now,
            "purchase_id": payload.purchase_id,
            "updated_at": now,
        }, "$unset": {"expires_at": 1}},
    )
    return {
        "title": "Confirmado OK",
        "results": {
            "reservation_id": payload.reservation_id,
            "status": "sold",
            "seats": [{"zone": s["zone"], "row": s["row"], "seat": s["seat"]} for s in r.get("seats", [])],
        },
    }


@app.post("/api/seats/release")
async def release_reservation(payload: ReleasePayload):
    """Libera una reserva manualmente (antes que expire el TTL)."""
    db = _ensure_mongo()
    reservations_coll = db[RESERVATIONS_COLLECTION]
    try:
        rid = ObjectId(payload.reservation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="reservation_id inválido")
    query = {"_id": rid, "status": "reserved"}
    if payload.session_id:
        query["session_id"] = payload.session_id
    deleted = reservations_coll.delete_one(query)
    return {"title": "OK", "results": {"released": deleted.deleted_count > 0}}


def pil_to_cv(img: Image.Image):
    import numpy as _np
    arr = _np.array(img)
    # RGB -> BGR para OpenCV/DeepFace
    return arr[:, :, ::-1].copy()


def detect_face(img: Image.Image) -> bool:
    try:
        import cv2
        arr = pil_to_cv(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_BGR2GRAY)
        cascade_path = getattr(cv2.data, 'haarcascades', '') + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.05,
            minNeighbors=3,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        return len(faces) > 0
    except Exception:
        import numpy as _np
        g = _np.array(img.convert('L'))
        mean = float(g.mean())
        std = float(g.std())
        if mean < 25 and std < 10:
            return False
        if std > 15 and 30 < mean < 200:
            return True
        return False


def combined_hash_similarity(img1: Image.Image, img2: Image.Image) -> float:
    h1p = imagehash.phash(img1)
    h2p = imagehash.phash(img2)
    dp = h1p - h2p
    mp = h1p.hash.size
    sp = max(0.0, min(1.0, 1.0 - (dp / float(mp))))

    h1d = imagehash.dhash(img1)
    h2d = imagehash.dhash(img2)
    dd = h1d - h2d
    md = h1d.hash.size
    sd = max(0.0, min(1.0, 1.0 - (dd / float(md))))

    h1a = imagehash.average_hash(img1)
    h2a = imagehash.average_hash(img2)
    da = h1a - h2a
    ma = h1a.hash.size
    sa = max(0.0, min(1.0, 1.0 - (da / float(ma))))

    return (sp * 0.5) + (sd * 0.3) + (sa * 0.2)


@app.get("/v1/user/search/{cedula}")
async def search_user_by_cedula(cedula: str):
    try:
        if not client:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        user = collection.find_one({"cedula": cedula})
        
        if user:
            return {
                "id": str(user.get("_id", "")),
                "name": user.get("name", ""),
                "lastname": user.get("lastname", ""),
                "email": user.get("email", ""),
                "cedula": user.get("cedula", ""),
                "telefono": user.get("telefono", ""),
                "password": user.get("password", "")
            }
        else:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar usuario: {str(e)}")


@app.put("/v1/user/update")
async def update_user(request: Request):
    try:
        if not client:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        data = await request.json()
        cedula = data.get("cedula")
        name = data.get("name")
        lastname = data.get("lastname")
        email = data.get("email")
        telefono = data.get("telefono")
        
        if not cedula:
            raise HTTPException(status_code=400, detail="Cédula es requerida")
        
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        user = collection.find_one({"cedula": cedula})
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if lastname is not None:
            update_data["lastname"] = lastname
        if email is not None:
            update_data["email"] = email
        if telefono is not None:
            update_data["telefono"] = telefono
        
        if update_data:
            collection.update_one({"cedula": cedula}, {"$set": update_data})
        
        return {"message": "Usuario actualizado exitosamente"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {str(e)}")


@app.delete("/v1/user/delete/{cedula}")
async def delete_user(cedula: str):
    try:
        if not client:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        user = collection.find_one({"cedula": cedula})
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        collection.delete_one({"cedula": cedula})
        
        return {"message": "Usuario eliminado exitosamente"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {str(e)}")


# Purchase/Sales models
class PurchaseData(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    documentType: str
    documentNumber: str
    address: str
    city: str
    seats: List[Dict[str, Any]]
    totalPrice: float
    purchaseDate: str
    reservation_id: Optional[str] = None
    session_id: Optional[str] = None
    event_id: Optional[str] = None


@app.post("/api/sales")
async def create_sale(purchase: PurchaseData):
    """Create a new sale/purchase. 
    - Si trae reservation_id+session_id: AUTOCONFIRMA la reserva (status sold permanente)"""
    if client is None:
        raise HTTPException(status_code=500, detail="Config error: MONGO_URI not set or invalid")

    try:
        db = client[DB_NAME]
        sales_collection = db[SALES_COLLECTION]
        reservations_coll = db[RESERVATIONS_COLLECTION]
        
        import time
        import random
        timestamp = str(int(time.time()))[-6:]
        random_str = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))
        purchase_id = f"QRT-{timestamp}-{random_str}"
        
        sale_document = {
            "purchaseId": purchase_id,
            "firstName": purchase.firstName,
            "lastName": purchase.lastName,
            "email": purchase.email,
            "phone": purchase.phone,
            "documentType": purchase.documentType,
            "documentNumber": purchase.documentNumber,
            "address": purchase.address,
            "city": purchase.city,
            "seats": purchase.seats,
            "totalPrice": purchase.totalPrice,
            "purchaseDate": purchase.purchaseDate,
            "event_id": purchase.event_id,
            "reservation_id": purchase.reservation_id,
            "status": "completed",
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        # ✅ AUTOCONFIRMAR reserva: pasar de "reserved" a "sold" PERMANENTE
        confirm_result: Optional[Dict[str, Any]] = None
        if purchase.reservation_id:
            try:
                rid = ObjectId(purchase.reservation_id)
                q = {"_id": rid, "status": "reserved"}
                if purchase.session_id:
                    q["session_id"] = purchase.session_id
                r_doc = reservations_coll.find_one(q)
                if r_doc:
                    reservations_coll.update_one(
                        {"_id": rid},
                        {"$set": {
                            "status": "sold",
                            "confirmed_at": datetime.datetime.utcnow(),
                            "purchase_id": purchase_id,
                            "updated_at": datetime.datetime.utcnow(),
                        }, "$unset": {"expires_at": 1}},
                    )
                    confirm_result = {"ok": True, "status": "sold"}
            except Exception as cerr:
                logger.warning(f"No se pudo confirmar reserva {purchase.reservation_id}: {cerr}")

        result = sales_collection.insert_one(sale_document)
        
        return {
            "title": "Compra procesada exitosamente",
            "results": {
                "success": True,
                "purchaseId": purchase_id,
                "insertedId": str(result.inserted_id),
                "reservation_confirmed": confirm_result,
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la compra: {str(e)}")


@app.post("/api/generate-tickets")
async def generate_tickets(request: Request):
    """Generate PDF tickets for a purchase"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from io import BytesIO
        from fastapi.responses import StreamingResponse
        import datetime
        import qrcode
        import uuid
        import json
        
        data = await request.json()
        
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        purchase_data = data.get('customerData', {})
        seats = data.get('seats', [])
        total_price = data.get('totalPrice', 0)
        purchase_id = data.get('purchaseId', str(uuid.uuid4())[:8].upper())
        
        seats_by_zone = {}
        for seat in seats:
            zone = seat.get('zone', 'General')
            if zone not in seats_by_zone:
                seats_by_zone[zone] = []
            seats_by_zone[zone].append(seat)
        
        page_count = 0
        
        for zone, zone_seats in seats_by_zone.items():
            if page_count > 0:
                p.showPage()
            
            page_count += 1
            
            p.setFont("Helvetica-Bold", 24)
            p.drawString(50, height - 80, "QRTIXPRO - Entrada de Evento")
            
            p.setFont("Helvetica-Bold", 14)
            p.drawString(50, height - 110, f"ID de Compra: {purchase_id}")
            p.setFont("Helvetica", 12)
            p.drawString(50, height - 130, f"Fecha de Compra: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}")
            
            p.setFont("Helvetica-Bold", 14)
            p.drawString(50, height - 160, "Información del Cliente:")
            p.setFont("Helvetica", 10)
            p.drawString(50, height - 180, f"Nombre: {purchase_data.get('firstName', '')} {purchase_data.get('lastName', '')}")
            p.drawString(50, height - 195, f"Email: {purchase_data.get('email', '')}")
            p.drawString(50, height - 210, f"Teléfono: {purchase_data.get('phone', '')}")
            p.drawString(50, height - 225, f"Documento: {purchase_data.get('documentType', '')} {purchase_data.get('documentNumber', '')}")
            
            p.setFont("Helvetica-Bold", 16)
            p.drawString(50, height - 260, f"Zona: {zone}")
            p.setFont("Helvetica-Bold", 14)
            p.drawString(50, height - 285, "Asientos en esta zona:")
            p.setFont("Helvetica", 12)
            y_position = height - 305
            
            for i, seat in enumerate(zone_seats):
                seat_info = f"• Fila {seat.get('row', '')}, Asiento {seat.get('seat', '')}"
                p.drawString(70, y_position, seat_info)
                y_position -= 20
            
            qr_data = {
                "purchaseId": purchase_id,
                "zone": zone,
                "seats": zone_seats,
                "customerName": f"{purchase_data.get('firstName', '')} {purchase_data.get('lastName', '')}",
                "email": purchase_data.get('email', '')
            }
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)
            
            from PIL import Image as PIL_Image
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_buffer = BytesIO()
            qr_img.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)
            
            from reportlab.lib.utils import ImageReader
            qr_image_reader = ImageReader(qr_buffer)
            p.drawImage(qr_image_reader, 400, y_position - 100, width=120, height=120)
            
            p.setFont("Helvetica", 10)
            p.drawString(400, y_position - 120, "Código QR - Entrada Válida")
            p.drawString(400, y_position - 135, f"Zona: {zone}")
            
            p.setFont("Helvetica", 9)
            p.drawString(50, 120, "INSTRUCCIONES:")
            p.drawString(50, 105, "• Presente este ticket en la entrada del evento")
            p.drawString(50, 90, "• El código QR será escaneado para validar su entrada")
            p.drawString(50, 75, "• Llegue 30 minutos antes del evento")
            p.drawString(50, 60, "• Este ticket es válido solo para la zona indicada")
            
            p.setFont("Helvetica-Bold", 10)
            p.drawString(50, 30, "Gracias por su compra - QRTIXPRO")
            p.drawString(400, 30, f"Página {page_count} de {len(seats_by_zone)}")
        
        p.save()
        buffer.seek(0)
        
        return StreamingResponse(
            BytesIO(buffer.read()),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=entradas.pdf"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar entradas: {str(e)}")


# Run with: uvicorn main:app --reload --port 8001
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
