import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from app.database import db_instance
from app.config import settings

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

class InMemoryAsyncCollection:
    def __init__(self):
        self.docs = []

    async def insert_one(self, doc):
        d = dict(doc)
        if "_id" not in d:
            d["_id"] = d.get("id", str(len(self.docs) + 1))
        self.docs.append(d)
        res = MagicMock()
        res.inserted_id = d["_id"]
        return res

    async def find_one(self, query=None, sort=None):
        if not query:
            return self.docs[0] if self.docs else None
        
        for d in self.docs:
            match = True
            for k, v in query.items():
                if k == "$or":
                    or_match = False
                    for condition in v:
                        for cond_k, cond_v in condition.items():
                            if d.get(cond_k) == cond_v:
                                or_match = True
                                break
                    if not or_match:
                        match = False
                        break
                elif k == "expires_at":
                    continue
                elif d.get(k) != v:
                    match = False
                    break
            if match:
                return dict(d)
        return None

    def find(self, query=None):
        matched = []
        for d in self.docs:
            if not query:
                matched.append(d)
                continue
            m = True
            for k, v in query.items():
                if d.get(k) != v:
                    m = False
                    break
            if m:
                matched.append(d)

        class AsyncCursor:
            def __init__(self, items):
                self.items = items

            def sort(self, *args, **kwargs):
                return self

            def skip(self, n):
                self.items = self.items[n:]
                return self

            def limit(self, n):
                self.items = self.items[:n]
                return self

            def __aiter__(self):
                self._iter = iter(self.items)
                return self

            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        return AsyncCursor(matched)

    async def update_one(self, filter_query, update_doc, upsert=False):
        doc = await self.find_one(filter_query)
        res = MagicMock()
        if doc:
            res.matched_count = 1
            if "$set" in update_doc:
                for k, v in update_doc["$set"].items():
                    doc[k] = v
            if "$inc" in update_doc:
                for k, v in update_doc["$inc"].items():
                    doc[k] = doc.get(k, 0) + v
            # update in array
            for i, d in enumerate(self.docs):
                if d.get("_id") == doc.get("_id"):
                    self.docs[i] = doc
                    break
        elif upsert:
            res.matched_count = 0
            new_doc = {}
            if "$set" in update_doc:
                new_doc.update(update_doc["$set"])
            new_doc.update(filter_query)
            await self.insert_one(new_doc)
        else:
            res.matched_count = 0
        return res

    async def update_many(self, filter_query, update_doc):
        for i, d in enumerate(self.docs):
            if "$set" in update_doc:
                for k, v in update_doc["$set"].items():
                    self.docs[i][k] = v
        res = MagicMock()
        res.matched_count = len(self.docs)
        return res

    async def count_documents(self, query=None):
        if not query:
            return len(self.docs)
        count = 0
        for d in self.docs:
            m = True
            for k, v in query.items():
                if d.get(k) != v:
                    m = False
                    break
            if m:
                count += 1
        return count

class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = InMemoryAsyncCollection()
        return self.collections[name]

@pytest.fixture(autouse=True)
def mock_mongo():
    mock_db = MockDatabase()
    db_instance.db = mock_db
    yield mock_db
