from typing import Tuple, Optional

# Approximate reference coordinates for districts and talukas in Maharashtra
KNOWN_LOCATIONS = {
    # Beed
    ("Beed", "Ashti"): (18.8021, 75.1784),
    ("Beed", "Gevrai"): (19.2635, 75.7533),
    ("Beed", "Ambajogai"): (18.7302, 76.3817),
    ("Beed", "Majalgaon"): (19.1558, 75.9392),
    ("Beed", None): (18.9891, 75.7601),
    
    # Latur
    ("Latur", "Ausa"): (18.2514, 76.5028),
    ("Latur", "Nilanga"): (18.1189, 76.7570),
    ("Latur", "Udgir"): (18.3942, 77.1174),
    ("Latur", None): (18.4088, 76.5604),
    
    # Ratnagiri
    ("Ratnagiri", "Chiplun"): (17.5284, 73.5421),
    ("Ratnagiri", "Guhagar"): (17.4853, 73.1950),
    ("Ratnagiri", "Khed"): (17.7212, 73.3855),
    ("Ratnagiri", None): (16.9902, 73.3120),
    
    # Chandrapur
    ("Chandrapur", "Bhadravati"): (20.0982, 79.1190),
    ("Chandrapur", "Warora"): (20.2312, 79.0068),
    ("Chandrapur", "Ballarpur"): (19.8519, 79.3512),
    ("Chandrapur", None): (19.9615, 79.2961),
    
    # Pune
    ("Pune", "Haveli"): (18.5793, 73.9824),
    ("Pune", "Baramati"): (18.1517, 74.5772),
    ("Pune", "Shirur"): (18.8268, 74.3788),
    ("Pune", None): (18.5204, 73.8567),
    
    # Nashik
    ("Nashik", "Malegaon"): (20.5539, 74.5306),
    ("Nashik", "Niphad"): (20.0760, 74.1080),
    ("Nashik", None): (19.9975, 73.7898),
    
    # Solapur
    ("Solapur", "Pandharpur"): (17.6775, 75.3275),
    ("Solapur", "Barshi"): (18.2333, 75.6967),
    ("Solapur", None): (17.6599, 75.9064),
    
    # Nagpur
    ("Nagpur", "Kamptee"): (21.2285, 79.1974),
    ("Nagpur", "Umred"): (20.8524, 79.3245),
    ("Nagpur", None): (21.1458, 79.0882),
}

def resolve_coordinates(district: str, taluka_or_ward: Optional[str] = None) -> Tuple[float, float]:
    """
    Resolves geographic coordinates from administrative entity names.
    Provides robust fallback to district centroid.
    """
    clean_dist = district.strip().title() if district else "Beed"
    clean_taluka = taluka_or_ward.strip().title() if taluka_or_ward else None

    # Check exact match
    if (clean_dist, clean_taluka) in KNOWN_LOCATIONS:
        return KNOWN_LOCATIONS[(clean_dist, clean_taluka)]
        
    # Check district fallback
    if (clean_dist, None) in KNOWN_LOCATIONS:
        base_lat, base_lng = KNOWN_LOCATIONS[(clean_dist, None)]
        # Add slight natural jitter if taluka is specified but not in exact dict
        if clean_taluka:
            return (base_lat + 0.015, base_lng + 0.012)
        return (base_lat, base_lng)

    # General default: Maharashtra geographic center
    return (19.7515, 75.7139)
