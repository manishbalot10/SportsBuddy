"""
ML-Based Player Matching Algorithm
This module uses machine learning to match players based on multiple factors
Perfect for a Python/ML focused intern to implement
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestRegressor
from typing import List, Dict, Tuple
import pickle
from datetime import datetime, time

class PlayerMatcher:
    """
    Intelligent player matching using ML techniques
    Considers: skill level, availability, location, play style, past matches
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.feature_weights = {
            'skill_similarity': 0.25,
            'distance': 0.20,
            'availability_overlap': 0.20,
            'sport_match': 0.15,
            'age_difference': 0.10,
            'rating': 0.10
        }
        
    def extract_features(self, player1: Dict, player2: Dict) -> np.ndarray:
        """Extract features for matching two players"""
        features = []
        
        # 1. Skill level similarity (0-1)
        skill_map = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Professional': 4}
        skill_diff = abs(skill_map.get(player1['skill_level'], 2) - 
                        skill_map.get(player2['skill_level'], 2))
        skill_similarity = 1 - (skill_diff / 3)  # Normalize to 0-1
        features.append(skill_similarity)
        
        # 2. Distance in km
        distance = self.calculate_distance(
            player1['latitude'], player1['longitude'],
            player2['latitude'], player2['longitude']
        )
        # Normalize: 0km = 1.0, 50km = 0.0
        distance_score = max(0, 1 - (distance / 50))
        features.append(distance_score)
        
        # 3. Availability overlap (how many common time slots)
        availability_score = self.calculate_availability_overlap(
            player1.get('availability', {}),
            player2.get('availability', {})
        )
        features.append(availability_score)
        
        # 4. Sport match (binary)
        sport_match = 1.0 if player1['sport'] == player2['sport'] else 0.0
        features.append(sport_match)
        
        # 5. Age difference (prefer similar ages)
        age_diff = abs(player1.get('age', 25) - player2.get('age', 25))
        age_score = max(0, 1 - (age_diff / 30))  # 30 year diff = 0 score
        features.append(age_score)
        
        # 6. Combined rating
        avg_rating = (player1.get('rating', 5.0) + player2.get('rating', 5.0)) / 2
        rating_score = avg_rating / 5.0  # Normalize to 0-1
        features.append(rating_score)
        
        # 7. Play style compatibility (would need historical data)
        play_style_score = self.calculate_play_style_compatibility(player1, player2)
        features.append(play_style_score)
        
        # 8. Previous match success rate (if they played before)
        history_score = self.get_match_history_score(player1['id'], player2['id'])
        features.append(history_score)
        
        return np.array(features)
    
    def calculate_distance(self, lat1: float, lon1: float, 
                         lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def calculate_availability_overlap(self, avail1: Dict, avail2: Dict) -> float:
        """Calculate how much two players' schedules overlap"""
        if not avail1 or not avail2:
            return 0.5  # Default middle score if no data
        
        days1 = set(avail1.get('days', []))
        days2 = set(avail2.get('days', []))
        
        if not days1 or not days2:
            return 0.5
        
        common_days = days1.intersection(days2)
        if not common_days:
            return 0.0
        
        # Check time overlap
        time1 = avail1.get('time', '18:00-20:00')
        time2 = avail2.get('time', '18:00-20:00')
        
        # Simple overlap check (could be more sophisticated)
        if time1 == time2:
            time_overlap = 1.0
        elif self.times_overlap(time1, time2):
            time_overlap = 0.5
        else:
            time_overlap = 0.0
        
        day_overlap = len(common_days) / max(len(days1), len(days2))
        
        return (day_overlap + time_overlap) / 2
    
    def times_overlap(self, time1: str, time2: str) -> bool:
        """Check if two time ranges overlap"""
        try:
            start1, end1 = time1.split('-')
            start2, end2 = time2.split('-')
            
            # Convert to minutes for easier comparison
            def to_minutes(time_str):
                h, m = map(int, time_str.split(':'))
                return h * 60 + m
            
            s1, e1 = to_minutes(start1), to_minutes(end1)
            s2, e2 = to_minutes(start2), to_minutes(end2)
            
            return not (e1 < s2 or e2 < s1)
        except:
            return False
    
    def calculate_play_style_compatibility(self, player1: Dict, player2: Dict) -> float:
        """
        Calculate compatibility based on play style preferences
        This would use historical data in production
        """
        # Simplified version - in production, this would use:
        # - Preferred game formats (singles/doubles/team)
        # - Competitive vs casual preference
        # - Preferred game duration
        # - Equipment preferences
        
        # For now, return a random compatibility score
        np.random.seed(player1['id'] + player2['id'])
        return np.random.uniform(0.4, 0.9)
    
    def get_match_history_score(self, player1_id: int, player2_id: int) -> float:
        """
        Get score based on previous matches between these players
        Would query the matches table in production
        """
        # In production, this would:
        # 1. Query matches table for games between these players
        # 2. Calculate win rate, enjoyment rating, rematch rate
        # 3. Return normalized score
        
        # Placeholder implementation
        return 0.5
    
    def predict_match_quality(self, player1: Dict, player2: Dict) -> Tuple[float, Dict]:
        """
        Predict the quality/success of a potential match
        Returns: (score 0-100, explanation dict)
        """
        features = self.extract_features(player1, player2)
        
        # Calculate weighted score
        feature_names = ['skill_similarity', 'distance', 'availability_overlap', 
                        'sport_match', 'age_difference', 'rating', 
                        'play_style', 'history']
        
        score = 0
        explanation = {}
        
        for i, name in enumerate(feature_names[:6]):  # Use first 6 weighted features
            weight = self.feature_weights.get(name, 0.1)
            contribution = features[i] * weight * 100
            score += contribution
            explanation[name] = {
                'value': features[i],
                'weight': weight,
                'contribution': contribution
            }
        
        # Bonus points for perfect sport match
        if features[3] == 1.0:  # sport_match
            score = min(100, score * 1.1)  # 10% bonus
            
        return score, explanation
    
    def find_best_matches(self, target_player: Dict, 
                         candidate_players: List[Dict], 
                         top_k: int = 10) -> List[Tuple[Dict, float]]:
        """
        Find the best matches for a target player
        Returns list of (player, score) tuples
        """
        matches = []
        
        for candidate in candidate_players:
            # Skip self
            if candidate['id'] == target_player['id']:
                continue
                
            score, _ = self.predict_match_quality(target_player, candidate)
            matches.append((candidate, score))
        
        # Sort by score descending
        matches.sort(key=lambda x: x[1], reverse=True)
        
        return matches[:top_k]
    
    def train_on_historical_data(self, matches_df: pd.DataFrame):
        """
        Train the model on historical match data
        This would be called periodically to improve predictions
        """
        # Extract features from successful matches
        X = []
        y = []  # Success score (based on ratings, rematches, etc.)
        
        for _, match in matches_df.iterrows():
            # Get player data (would query from database)
            player1 = self.get_player_data(match['user1_id'])
            player2 = self.get_player_data(match['user2_id'])
            
            features = self.extract_features(player1, player2)
            success_score = self.calculate_match_success(match)
            
            X.append(features)
            y.append(success_score)
        
        # Train the model
        X = np.array(X)
        y = np.array(y)
        
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        self.model.fit(X_scaled, y)
        
        # Save the trained model
        self.save_model()
    
    def get_player_data(self, player_id: int) -> Dict:
        """Placeholder for database query"""
        # In production, this would query the users table
        return {}
    
    def calculate_match_success(self, match: pd.Series) -> float:
        """Calculate how successful a match was based on outcomes"""
        # Factors to consider:
        # - Both players showed up
        # - Post-match ratings
        # - Whether they rematched
        # - Duration of play
        # - Feedback sentiment
        
        # Placeholder
        return np.random.uniform(0, 100)
    
    def save_model(self, path: str = 'models/player_matcher.pkl'):
        """Save the trained model"""
        with open(path, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler,
                'weights': self.feature_weights
            }, f)
    
    def load_model(self, path: str = 'models/player_matcher.pkl'):
        """Load a trained model"""
        with open(path, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.scaler = data['scaler']
            self.feature_weights = data['weights']


# Usage example
if __name__ == "__main__":
    matcher = PlayerMatcher()
    
    # Example players
    player_a = {
        'id': 1,
        'name': 'Raj Kumar',
        'sport': 'Cricket',
        'skill_level': 'Intermediate',
        'age': 25,
        'latitude': 19.0760,
        'longitude': 72.8777,
        'rating': 4.5,
        'availability': {
            'days': ['Mon', 'Wed', 'Fri'],
            'time': '18:00-20:00'
        }
    }
    
    player_b = {
        'id': 2,
        'name': 'Priya Sharma',
        'sport': 'Cricket',
        'skill_level': 'Intermediate',
        'age': 23,
        'latitude': 19.0822,
        'longitude': 72.8812,
        'rating': 4.7,
        'availability': {
            'days': ['Wed', 'Fri', 'Sat'],
            'time': '17:00-19:00'
        }
    }
    
    score, explanation = matcher.predict_match_quality(player_a, player_b)
    print(f"Match Quality Score: {score:.1f}/100")
    print("\nScore Breakdown:")
    for factor, details in explanation.items():
        print(f"  {factor}: {details['contribution']:.1f} points")
