"""
Redis caching service for LLM responses and expensive operations
"""
import redis
import json
import logging
import os
from typing import Optional, Any, Dict
from datetime import timedelta
import hashlib

logger = logging.getLogger(__name__)

class CacheService:
    """Manages caching using Redis"""
    
    def __init__(self):
        """Initialize Redis connection"""
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.enabled = os.getenv("ENABLE_CACHE", "true").lower() == "true"
        self.ttl = int(os.getenv("CACHE_TTL_SECONDS", 3600))  # 1 hour default
        
        self.client = None
        if self.enabled:
            try:
                self.client = redis.from_url(self.redis_url)
                # Test connection
                self.client.ping()
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis cache: {e}. Cache disabled.")
                self.enabled = False
    
    def _generate_key(self, prefix: str, params: Dict[str, Any]) -> str:
        """Generate cache key from prefix and parameters"""
        # Create a stable hash of the parameters
        params_str = json.dumps(params, sort_keys=True)
        params_hash = hashlib.md5(params_str.encode()).hexdigest()
        return f"{prefix}:{params_hash}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.client:
            return None
        
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
        
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with TTL"""
        if not self.enabled or not self.client:
            return False
        
        try:
            ttl = ttl or self.ttl
            serialized = json.dumps(value)
            self.client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
        
        return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.enabled or not self.client:
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
        
        return False
    
    def clear_prefix(self, prefix: str) -> int:
        """Clear all cache keys with given prefix"""
        if not self.enabled or not self.client:
            return 0
        
        try:
            pattern = f"{prefix}:*"
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error clearing cache prefix {prefix}: {e}")
        
        return 0
    
    def cache_response(
        self, 
        prefix: str, 
        params: Dict[str, Any], 
        ttl: Optional[int] = None
    ):
        """Decorator for caching function responses"""
        def decorator(func):
            async def async_wrapper(*args, **kwargs):
                cache_key = self._generate_key(prefix, params)
                
                # Try to get from cache
                cached = self.get(cache_key)
                if cached is not None:
                    logger.debug(f"Cache hit for {cache_key}")
                    return cached
                
                # Call function and cache result
                result = await func(*args, **kwargs) if hasattr(func, '__await__') else func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                return result
            
            def sync_wrapper(*args, **kwargs):
                cache_key = self._generate_key(prefix, params)
                
                # Try to get from cache
                cached = self.get(cache_key)
                if cached is not None:
                    logger.debug(f"Cache hit for {cache_key}")
                    return cached
                
                # Call function and cache result
                result = func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                return result
            
            return async_wrapper if hasattr(func, '__await__') else sync_wrapper
        
        return decorator

# Cache prefixes (use these for consistent naming)
CACHE_PREFIXES = {
    "resume_analysis": "resume:analysis",
    "job_analysis": "job:analysis",
    "skill_matching": "matching:skills",
    "user_profile": "user:profile",
    "rag_query": "rag:query",
    "llm_response": "llm:response",
}

# Global cache service instance
cache_service = CacheService()

# High-level cache functions
def cache_llm_response(query: str, agent: str, ttl: int = 3600) -> Optional[Dict]:
    """Cache LLM response"""
    key = f"{CACHE_PREFIXES['llm_response']}:{agent}:{hashlib.md5(query.encode()).hexdigest()}"
    return cache_service.get(key)

def set_cached_llm_response(query: str, agent: str, response: Dict, ttl: int = 3600) -> bool:
    """Set cached LLM response"""
    key = f"{CACHE_PREFIXES['llm_response']}:{agent}:{hashlib.md5(query.encode()).hexdigest()}"
    return cache_service.set(key, response, ttl)

def cache_user_profile(user_id: str) -> Optional[Dict]:
    """Get cached user profile"""
    key = f"{CACHE_PREFIXES['user_profile']}:{user_id}"
    return cache_service.get(key)

def set_cached_user_profile(user_id: str, profile: Dict, ttl: int = 1800) -> bool:
    """Set cached user profile"""
    key = f"{CACHE_PREFIXES['user_profile']}:{user_id}"
    return cache_service.set(key, profile, ttl)

def invalidate_user_cache(user_id: str) -> int:
    """Invalidate all cache entries for a user"""
    prefix = f"{CACHE_PREFIXES['user_profile']}:{user_id}"
    return cache_service.clear_prefix(prefix)
