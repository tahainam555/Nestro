"""
Test harness for the orchestrator.
Tests various scenarios: text-only, multimodal, with/without budget.
"""

import json
import os
import sys
from orchestrator import run_orchestrator


def print_section(title: str) -> None:
    """Print formatted section header."""
    print(f"\n{'='*80}")
    print(f"{title}")
    print(f"{'='*80}\n")


def test_text_only_no_budget():
    """Test 1: Text-only input without budget."""
    print_section("TEST 1: Text-Only Input (No Budget)")
    
    response = run_orchestrator(
        input_text="I want to redesign my living room with a modern minimalist style. I like clean lines and neutral colors.",
        image_url="",
        user_id="test_user_001",
    )
    
    print("\nRESPONSE:")
    print(json.dumps(response, indent=2))
    
    # Assertions
    assert response["style"], "Style should not be empty"
    assert response["room_summary"], "Room summary should not be empty"
    assert response["design_plan"], "Design plan should not be empty"
    assert len(response["color_palette"]) > 0, "Color palette should not be empty"
    print("\n✓ TEST 1 PASSED")


def test_text_only_with_budget():
    """Test 2: Text-only input with budget constraint."""
    print_section("TEST 2: Text-Only Input (With Budget)")
    
    response = run_orchestrator(
        input_text="Scandinavian bedroom design. Budget: 100000 PKR",
        image_url="",
        user_id="test_user_002",
    )
    
    print("\nRESPONSE:")
    print(json.dumps(response, indent=2))
    
    # Assertions
    assert response["style"], "Style should not be empty"
    assert response["budget"] == 100000, f"Budget should be 100000, got {response['budget']}"
    total_cost = sum(p.get("price", 0) for p in response["products"])
    assert total_cost <= response["budget"], f"Total cost {total_cost} exceeds budget {response['budget']}"
    print("\n✓ TEST 2 PASSED")


def test_multimodal():
    """Test 3: Multimodal input (text + image)."""
    print_section("TEST 3: Multimodal Input (Text + Image)")
    
    response = run_orchestrator(
        input_text="Make this room feel more spacious and bright. Add a luxury touch.",
        image_url="https://example.com/room.jpg",
        user_id="test_user_003",
    )
    
    print("\nRESPONSE:")
    print(json.dumps(response, indent=2))
    
    # Assertions
    assert response["style"], "Style should not be empty"
    assert response["room_summary"], "Room summary should not be empty"
    print("\n✓ TEST 3 PASSED")


def test_error_handling():
    """Test 4: Error handling with invalid inputs."""
    print_section("TEST 4: Error Handling")
    
    response = run_orchestrator(
        input_text="",  # Empty input
        image_url="",
        user_id="test_user_004",
    )
    
    print("\nRESPONSE:")
    print(json.dumps(response, indent=2))
    
    # Even with empty input, pipeline should complete
    assert isinstance(response, dict), "Response should be a dict"
    print("\n✓ TEST 4 PASSED")


def test_high_budget():
    """Test 5: High budget luxury design."""
    print_section("TEST 5: High Budget Luxury Design")
    
    response = run_orchestrator(
        input_text="Luxury modern living room. Premium materials and designer furniture. Budget: 500000 PKR",
        image_url="",
        user_id="test_user_005",
    )
    
    print("\nRESPONSE:")
    print(json.dumps(response, indent=2))
    
    # Assertions
    assert response["budget"] == 500000, f"Budget should be 500000, got {response['budget']}"
    assert response["style"], "Style should not be empty"
    print("\n✓ TEST 5 PASSED")


def run_all_tests():
    """Run all test scenarios."""
    print_section("ORCHESTRATOR TEST HARNESS")
    print(f"MOCK_MODE: {os.getenv('MOCK_MODE', 'true')}")
    print(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
    
    tests = [
        test_text_only_no_budget,
        test_text_only_with_budget,
        test_multimodal,
        test_error_handling,
        test_high_budget,
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"\n✗ TEST FAILED: {str(e)}")
            failed += 1
            import traceback
            traceback.print_exc()
    
    print_section("TEST SUMMARY")
    print(f"Total Tests: {len(tests)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed / len(tests)) * 100:.1f}%")
    
    if failed == 0:
        print("\n✓ ALL TESTS PASSED!")
    else:
        print(f"\n✗ {failed} TEST(S) FAILED")
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()
