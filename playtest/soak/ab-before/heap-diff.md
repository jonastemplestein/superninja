# Heap growth over the soak (ab-before)

Snapshots after a forced GC: at the start (on the map) and after the last level (on the map). Total 6,778.7 KB → 15,242.1 KB. Blink (C++) objects are included by the snapshot as native nodes.

## Biggest growth by size

| constructor | count now | Δ count | size now KB | Δ size KB |
|---|---|---|---|---|
| (code) | 57207 | +30442 | 5,757.2 | +4,071.2 |
| blink::NetworkResourcesData::ResourceData | 4926 | +4862 | 1,385.4 | +1,367.4 |
| (string) | 31878 | +8756 | 1,034.7 | +744.8 |
| (object shape) | 9055 | +4688 | 450.5 | +209.1 |
| system / FunctionTemplateInfo | 5818 | +1844 | 363.5 | +115.3 |
| system / WeakArrayList | 1094 | +1000 | 91.1 | +87.2 |
| CanvasRenderingContext2D | 50 | +47 | 80 | +78.3 |
| blink::ImmutableCSSPropertyValueSet | 1448 | +392 | 153.8 | +70.5 |
| blink::HeapHashTableBacking<blink::HashTable<blink::FontCacheKey, blink::KeyValu | 26 | +11 | 89.5 | +70.1 |
| Object | 7734 | +2498 | 196.1 | +61.7 |
| blink::CSSValueList | 2171 | +1172 | 101.8 | +54.9 |
| blink::ImageResource | 35 | +18 | 100.6 | +51.8 |
| (array) | 2968 | +642 | 440.3 | +50.4 |
| vi | 607 | +426 | 61.4 | +43.2 |
| <audio preload="auto" loop="" crossorigin="anonymous"> | 27 | +27 | 42.8 | +42.8 |
| system / ExternalStringData | 1444 | +1097 | 1,675.3 | +35.1 |
| blink::CanvasRenderingContext2DState | 48 | +47 | 35.3 | +34.5 |
| blink::GeometryMapperTransformCache | 198 | +103 | 65 | +33.8 |
| system / ArrayList | 250 | +124 | 88.8 | +33.1 |
| blink::SelectorQuery | 130 | +123 | 33.5 | +31.7 |
| blink::GeometryMapperTransformCache::PlaneRootTransform | 183 | +98 | 51.5 | +27.6 |
| PerformanceResourceTiming | 252 | +189 | 35.5 | +27.3 |
| blink::HeapHashTableBacking<blink::HashTable<cppgc::internal::BasicMember<blink: | 333 | +126 | 48.5 | +27.2 |
| blink::TransformPaintPropertyNode | 198 | +103 | 49.5 | +25.8 |
| blink::HeapHashTableBacking<blink::HashTable<cppgc::internal::BasicMember<const  | 97 | +58 | 31.4 | +25.6 |
| blink::UniqueElementData | 339 | +228 | 37.1 | +24.9 |
| DOMRectReadOnly | 440 | +436 | 24 | +23.7 |
| blink::ComputedStyle | 487 | +320 | 34.2 | +22.5 |
| (number) | 15393 | +5948 | 57.9 | +22.2 |
| LayoutShift | 150 | +149 | 22.3 | +22.1 |

## Biggest growth by count

| constructor | count now | Δ count | size now KB | Δ size KB |
|---|---|---|---|---|
| (code) | 57207 | +30442 | 5,757.2 | +4,071.2 |
| (string) | 31878 | +8756 | 1,034.7 | +744.8 |
| (number) | 15393 | +5948 | 57.9 | +22.2 |
| blink::NetworkResourcesData::ResourceData | 4926 | +4862 | 1,385.4 | +1,367.4 |
| (object shape) | 9055 | +4688 | 450.5 | +209.1 |
| Object | 7734 | +2498 | 196.1 | +61.7 |
| system / FunctionTemplateInfo | 5818 | +1844 | 363.5 | +115.3 |
| blink::CSSValueList | 2171 | +1172 | 101.8 | +54.9 |
| system / ExternalStringData | 1444 | +1097 | 1,675.3 | +35.1 |
| system / AccessorPair | 3146 | +1077 | 36.9 | +12.6 |
| system / WeakArrayList | 1094 | +1000 | 91.1 | +87.2 |
| Array | 5989 | +726 | 93.6 | +11.3 |
| blink::CSSNumericLiteralValue | 1743 | +709 | 40.9 | +16.6 |
| (array) | 2968 | +642 | 440.3 | +50.4 |
| system / PropertyArray | 1024 | +532 | 27.2 | +12.3 |
| DOMRectReadOnly | 440 | +436 | 24 | +23.7 |
| vi | 607 | +426 | 61.4 | +43.2 |
| blink::cssvalue::CSSColor | 533 | +420 | 16.7 | +13.1 |
| system / ProtectedFixedArray | 429 | +408 | 6.1 | +5.8 |
| system / SharedFunctionInfoWrapper | 428 | +408 | 3.3 | +3.2 |
| blink::ImmutableCSSPropertyValueSet | 1448 | +392 | 153.8 | +70.5 |
| blink::ComputedStyle | 487 | +320 | 34.2 | +22.5 |
| (concatenated string) | 884 | +310 | 17.3 | +6.1 |
| blink::UniqueElementData | 339 | +228 | 37.1 | +24.9 |
| LayoutShiftAttribution | 218 | +216 | 8.5 | +8.4 |
| AudioBuffer | 206 | +202 | 12.8 | +12.6 |
| ArrayBuffer | 210 | +202 | 13.1 | +12.6 |
| Float32Array | 208 | +202 | 11.4 | +11 |
| Promise | 210 | +202 | 4.1 | +3.9 |
| blink::HeapVectorBacking<cppgc::internal::BasicMember<blink::DOMTypedArray<float | 204 | +202 | 3.2 | +3.2 |
