import streamlit as st
import pandas as pd
import plotly.express as px
import folium
from streamlit_folium import st_folium
import psycopg2
import os
from dotenv import load_dotenv
import sys

# Add parent directory to path to allow importing from app or ml_features if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# Page Config
st.set_page_config(
    page_title="SportsBuddy Admin Dashboard",
    page_icon="🏅",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Database Connection
@st.cache_resource
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'sportsbuddy'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres')
        )
        return conn
    except Exception as e:
        st.error(f"Database connection failed: {e}")
        return None

# Fetch Data Functions
@st.cache_data(ttl=300)
def get_total_stats():
    conn = get_db_connection()
    if not conn: return None
    
    try:
        cursor = conn.cursor()
        
        # Total Users
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Total Active Users
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = true")
        active_users = cursor.fetchone()[0]
        
        # Total Sports
        cursor.execute("SELECT COUNT(DISTINCT sport) FROM users")
        total_sports = cursor.fetchone()[0]
        
        # Total Cities
        cursor.execute("SELECT COUNT(DISTINCT city) FROM users")
        total_cities = cursor.fetchone()[0]
        
        cursor.close()
        return {
            "users": total_users,
            "active": active_users,
            "sports": total_sports,
            "cities": total_cities
        }
    except Exception as e:
        st.error(f"Error fetching stats: {e}")
        return None

@st.cache_data(ttl=300)
def get_sports_distribution():
    conn = get_db_connection()
    if not conn: return pd.DataFrame()
    
    query = """
        SELECT sport, COUNT(*) as count 
        FROM users 
        GROUP BY sport 
        ORDER BY count DESC
    """
    return pd.read_sql_query(query, conn)

@st.cache_data(ttl=300)
def get_city_distribution():
    conn = get_db_connection()
    if not conn: return pd.DataFrame()
    
    query = """
        SELECT city, COUNT(*) as count 
        FROM users 
        GROUP BY city 
        ORDER BY count DESC
        LIMIT 20
    """
    return pd.read_sql_query(query, conn)

@st.cache_data(ttl=300)
def get_user_locations(limit=1000):
    conn = get_db_connection()
    if not conn: return pd.DataFrame()
    
    query = f"""
        SELECT 
            id, name, sport, skill_level, city,
            ST_Y(location::geometry) as lat, 
            ST_X(location::geometry) as lng 
        FROM users 
        WHERE is_active = true 
        LIMIT {limit}
    """
    return pd.read_sql_query(query, conn)

# Dashboard Layout
st.title("🏅 SportsBuddy Admin Dashboard")
st.markdown("Monitor user growth, demographics, and platform activity.")

# Sidebar
st.sidebar.header("Filter Options")
selected_city = st.sidebar.selectbox(
    "Select City",
    ["All Cities"] + sorted(get_city_distribution()['city'].tolist())
)

# 1. Key Metrics Row
stats = get_total_stats()
if stats:
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Users", f"{stats['users']:,}")
    col2.metric("Active Users", f"{stats['active']:,}")
    col3.metric("Sports Categories", stats['sports'])
    col4.metric("Cities Covered", stats['cities'])

st.divider()

# 2. Charts Row
col1, col2 = st.columns(2)

with col1:
    st.subheader("🏆 Popular Sports")
    df_sports = get_sports_distribution()
    if not df_sports.empty:
        fig_sports = px.bar(
            df_sports.head(10), 
            x='count', 
            y='sport', 
            orientation='h',
            color='count',
            color_continuous_scale='Viridis',
            title="Top 10 Sports by User Count"
        )
        fig_sports.update_layout(yaxis={'categoryorder':'total ascending'})
        st.plotly_chart(fig_sports, use_container_width=True)

with col2:
    st.subheader("🏙️ Top Cities")
    df_cities = get_city_distribution()
    if not df_cities.empty:
        fig_cities = px.pie(
            df_cities.head(8), 
            values='count', 
            names='city', 
            title="User Distribution by City",
            hole=0.4
        )
        st.plotly_chart(fig_cities, use_container_width=True)

st.divider()

# 3. Geospatial Analysis
st.subheader("📍 User Heatmap & Clustering")

df_map = get_user_locations()

if not df_map.empty:
    if selected_city != "All Cities":
        df_map = df_map[df_map['city'] == selected_city]

    # Center map on India or selected city
    if selected_city == "All Cities":
        center_lat, center_lng = 20.5937, 78.9629
        zoom = 5
    else:
        center_lat = df_map['lat'].mean()
        center_lng = df_map['lng'].mean()
        zoom = 11

    m = folium.Map(location=[center_lat, center_lng], zoom_start=zoom, tiles="CartoDB voyager")
    
    # Add Heatmap
    from folium.plugins import HeatMap, MarkerCluster
    
    heat_data = [[row['lat'], row['lng']] for index, row in df_map.iterrows()]
    HeatMap(heat_data, radius=15, blur=10).add_to(m)
    
    # Add Clusters (limit markers to avoid lag if too many)
    if len(df_map) < 2000:
        marker_cluster = MarkerCluster().add_to(m)
        for idx, row in df_map.iterrows():
            folium.Marker(
                location=[row['lat'], row['lng']],
                popup=f"<b>{row['name']}</b><br>{row['sport']} ({row['skill_level']})",
                icon=folium.Icon(color='blue', icon='user', prefix='fa')
            ).add_to(marker_cluster)
            
    st_folium(m, height=500, use_container_width=True)

else:
    st.warning("No location data available.")

st.markdown("---")
st.caption("SportsBuddy Intern Project • Backend & ML Dashboard")
