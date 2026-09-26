# Heap growth over the soak (ab-after)

Snapshots after a forced GC: at the start (on the map) and after the last level (on the map). Total 6,763.8 KB → 15,110.3 KB. Blink (C++) objects are included by the snapshot as native nodes.

## Biggest growth by size

| constructor | count now | Δ count | size now KB | Δ size KB |
|---|---|---|---|---|
| (code) | 57638 | +30865 | 5,783.6 | +4,117.9 |
| blink::NetworkResourcesData::ResourceData | 4355 | +4291 | 1,224.8 | +1,206.8 |
| (string) | 31900 | +8741 | 1,031.7 | +741.7 |
| (object shape) | 9058 | +4683 | 450 | +208.5 |
| system / FunctionTemplateInfo | 5818 | +1844 | 363.5 | +115.3 |
| blink::HeapHashTableBacking<blink::HashTable<blink::FontCacheKey, blink::KeyValu | 26 | +11 | 131.5 | +112.1 |
| system / WeakArrayList | 1103 | +1009 | 92.7 | +88.8 |
| CanvasRenderingContext2D | 50 | +47 | 80 | +78.3 |
| blink::ImmutableCSSPropertyValueSet | 1451 | +395 | 153.7 | +70.6 |
| Object | 7741 | +2503 | 196.3 | +61.8 |
| (array) | 2966 | +638 | 445.2 | +55.2 |
| blink::CSSValueList | 2172 | +1173 | 101.8 | +55 |
| blink::ImageResource | 35 | +18 | 100.6 | +51.8 |
| bi | 606 | +425 | 61.4 | +43.2 |
| blink::HashTrieNode<blink::CSSVariableData> | 156 | +144 | 41.4 | +38.3 |
| blink::CanvasRenderingContext2DState | 48 | +47 | 35.3 | +34.5 |
| blink::GeometryMapperTransformCache | 198 | +103 | 65 | +33.8 |
| system / ExternalStringData | 1388 | +1041 | 1,675.1 | +33.5 |
| system / ArrayList | 250 | +124 | 88.8 | +33.1 |
| blink::SelectorQuery | 133 | +126 | 34.3 | +32.5 |
| blink::HeapHashTableBacking<blink::HashTable<std::pair<blink::String, blink::Tex | 4 | +4 | 29.3 | +29.3 |
| blink::GeometryMapperTransformCache::PlaneRootTransform | 183 | +98 | 51.5 | +27.6 |
| blink::ComputedStyle | 545 | +378 | 38.3 | +26.6 |
| blink::HeapHashTableBacking<blink::HashTable<cppgc::internal::BasicMember<const  | 97 | +58 | 31.9 | +26.1 |
| blink::TransformPaintPropertyNode | 198 | +103 | 49.5 | +25.8 |
| PerformanceResourceTiming | 252 | +189 | 33.5 | +25.3 |
| DOMRectReadOnly | 434 | +430 | 23.6 | +23.4 |
| (number) | 15474 | +6001 | 58.5 | +22.7 |
| LayoutShift | 150 | +149 | 22.3 | +22.1 |
| blink::UniqueElementData | 313 | +201 | 34.2 | +22 |

## Biggest growth by count

| constructor | count now | Δ count | size now KB | Δ size KB |
|---|---|---|---|---|
| (code) | 57638 | +30865 | 5,783.6 | +4,117.9 |
| (string) | 31900 | +8741 | 1,031.7 | +741.7 |
| (number) | 15474 | +6001 | 58.5 | +22.7 |
| (object shape) | 9058 | +4683 | 450 | +208.5 |
| blink::NetworkResourcesData::ResourceData | 4355 | +4291 | 1,224.8 | +1,206.8 |
| Object | 7741 | +2503 | 196.3 | +61.8 |
| system / FunctionTemplateInfo | 5818 | +1844 | 363.5 | +115.3 |
| blink::CSSValueList | 2172 | +1173 | 101.8 | +55 |
| system / AccessorPair | 3146 | +1077 | 36.9 | +12.6 |
| system / ExternalStringData | 1388 | +1041 | 1,675.1 | +33.5 |
| system / WeakArrayList | 1103 | +1009 | 92.7 | +88.8 |
| Array | 5987 | +723 | 93.6 | +11.3 |
| blink::CSSNumericLiteralValue | 1747 | +713 | 40.9 | +16.7 |
| (array) | 2966 | +638 | 445.2 | +55.2 |
| system / PropertyArray | 1028 | +535 | 27.2 | +12.3 |
| DOMRectReadOnly | 434 | +430 | 23.6 | +23.4 |
| bi | 606 | +425 | 61.4 | +43.2 |
| blink::cssvalue::CSSColor | 531 | +418 | 16.6 | +13.1 |
| system / ProtectedFixedArray | 430 | +410 | 6.1 | +5.8 |
| system / SharedFunctionInfoWrapper | 429 | +410 | 3.4 | +3.2 |
| blink::ImmutableCSSPropertyValueSet | 1451 | +395 | 153.7 | +70.6 |
| blink::ComputedStyle | 545 | +378 | 38.3 | +26.6 |
| (concatenated string) | 886 | +314 | 17.3 | +6.1 |
| LayoutShiftAttribution | 215 | +213 | 8.4 | +8.3 |
| blink::CSSVariableData | 593 | +210 | 35.7 | +10.6 |
| system / ObjectTemplateInfo | 400 | +201 | 10.9 | +5.5 |
| blink::UniqueElementData | 313 | +201 | 34.2 | +22 |
| PerformanceResourceTiming | 252 | +189 | 33.5 | +25.3 |
| blink::CSSValuePair | 332 | +187 | 7.8 | +4.4 |
| blink::SVGLength | 208 | +166 | 6.5 | +5.2 |
